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

/**
 * Builds V2 - CI/CD Build Management
 * Manages build pipelines, tests, and CI/CD workflows
 */
export default function BuildsV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'success' | 'failed' | 'running'>('all')

  const stats = [
    { label: 'Total Builds', value: '12,847', change: 23.4, icon: <Package className="w-5 h-5" /> },
    { label: 'Success Rate', value: '94.2%', change: 5.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Duration', value: '6.8m', change: -12.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Pipelines', value: '24', change: 8.9, icon: <Zap className="w-5 h-5" /> }
  ]

  const builds = [
    {
      id: 'BUILD-8473',
      pipeline: 'Main CI/CD',
      branch: 'main',
      commit: 'Fix authentication bug',
      commitHash: 'a7f3c92',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      status: 'success',
      duration: 412,
      startTime: '2024-02-12 14:32:15',
      tests: { passed: 2847, failed: 0, total: 2847 },
      coverage: 94.7,
      artifacts: 12,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'BUILD-8472',
      pipeline: 'Feature Branch',
      branch: 'feature/payment',
      commit: 'Add payment gateway integration',
      commitHash: 'b8d4e53',
      author: 'Michael Chen',
      avatar: 'MC',
      status: 'running',
      duration: 0,
      startTime: '2024-02-12 14:45:20',
      tests: { passed: 1247, failed: 0, total: 2847 },
      coverage: 0,
      artifacts: 0,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'BUILD-8471',
      pipeline: 'Pull Request',
      branch: 'pr/247-fix-ui',
      commit: 'Fix responsive layout issues',
      commitHash: 'c9e5f64',
      author: 'Emily Rodriguez',
      avatar: 'ER',
      status: 'failed',
      duration: 124,
      startTime: '2024-02-12 13:20:10',
      tests: { passed: 2789, failed: 58, total: 2847 },
      coverage: 88.3,
      artifacts: 0,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'BUILD-8470',
      pipeline: 'Release',
      branch: 'release/v3.2.0',
      commit: 'Release v3.2.0',
      commitHash: 'd1f6a75',
      author: 'David Park',
      avatar: 'DP',
      status: 'success',
      duration: 689,
      startTime: '2024-02-12 12:15:30',
      tests: { passed: 2847, failed: 0, total: 2847 },
      coverage: 95.8,
      artifacts: 24,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'BUILD-8469',
      pipeline: 'Main CI/CD',
      branch: 'main',
      commit: 'Update dependencies',
      commitHash: 'e2g7b86',
      author: 'Lisa Anderson',
      avatar: 'LA',
      status: 'success',
      duration: 387,
      startTime: '2024-02-12 11:30:45',
      tests: { passed: 2847, failed: 0, total: 2847 },
      coverage: 93.2,
      artifacts: 12,
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'BUILD-8468',
      pipeline: 'Nightly',
      branch: 'develop',
      commit: 'Daily integration build',
      commitHash: 'f3h8c97',
      author: 'James Wilson',
      avatar: 'JW',
      status: 'success',
      duration: 523,
      startTime: '2024-02-12 02:00:00',
      tests: { passed: 2843, failed: 4, total: 2847 },
      coverage: 91.5,
      artifacts: 18,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'BUILD-8467',
      pipeline: 'Hotfix',
      branch: 'hotfix/critical',
      commit: 'Emergency security patch',
      commitHash: 'g4i9d08',
      author: 'Maria Garcia',
      avatar: 'MG',
      status: 'success',
      duration: 298,
      startTime: '2024-02-11 23:45:15',
      tests: { passed: 2847, failed: 0, total: 2847 },
      coverage: 92.8,
      artifacts: 8,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'BUILD-8466',
      pipeline: 'Feature Branch',
      branch: 'feature/analytics',
      commit: 'Add analytics dashboard',
      commitHash: 'h5j0e19',
      author: 'Robert Brown',
      avatar: 'RB',
      status: 'failed',
      duration: 201,
      startTime: '2024-02-11 20:30:40',
      tests: { passed: 2712, failed: 135, total: 2847 },
      coverage: 85.7,
      artifacts: 0,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const topBuilders = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '847', change: 23.4 },
    { rank: 2, name: 'Michael Chen', avatar: 'MC', value: '692', change: 18.7 },
    { rank: 3, name: 'David Park', avatar: 'DP', value: '534', change: 12.3 },
    { rank: 4, name: 'Emily Rodriguez', avatar: 'ER', value: '421', change: 8.9 },
    { rank: 5, name: 'Lisa Anderson', avatar: 'LA', value: '347', change: 5.2 }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Build #8473 passed', time: '5m ago', type: 'success' as const },
    { icon: <Play className="w-4 h-4" />, title: 'Build #8472 started', time: '10m ago', type: 'info' as const },
    { icon: <XCircle className="w-4 h-4" />, title: 'Build #8471 failed', time: '1h ago', type: 'error' as const },
    { icon: <Package className="w-4 h-4" />, title: 'Artifacts published', time: '2h ago', type: 'success' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Success' }
      case 'running':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="w-3 h-3" />, label: 'Running' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" />, label: 'Failed' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertTriangle className="w-3 h-3" />, label: status }
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
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
          <GradientButton from="teal" to="cyan" onClick={() => console.log('Trigger build')}>
            <Play className="w-5 h-5 mr-2" />
            Trigger Build
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

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
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {builds.map((build) => {
                  const statusBadge = getStatusBadge(build.status)
                  const testSuccessRate = build.tests.total > 0 ? (build.tests.passed / build.tests.total) * 100 : 0

                  return (
                    <div key={build.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${build.color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {build.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{build.id}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{build.pipeline} by {build.author}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <GitBranch className="w-3 h-3" />
                                <span>{build.branch}</span>
                                <span>•</span>
                                <span className="font-mono">{build.commitHash}</span>
                                <span>•</span>
                                <span>{build.commit}</span>
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
                            <p className="font-semibold">{build.duration > 0 ? formatDuration(build.duration) : 'Running...'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Tests</p>
                            <p className="font-semibold">
                              <span className="text-green-600">{build.tests.passed}</span> / {build.tests.total}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Coverage</p>
                            <p className="font-semibold">{build.coverage > 0 ? `${build.coverage}%` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Artifacts</p>
                            <p className="font-semibold">{build.artifacts} files</p>
                          </div>
                        </div>

                        {build.tests.total > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Test Results</span>
                              <span className="font-semibold">{testSuccessRate.toFixed(1)}% passed</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${build.color}`}
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
                          {build.artifacts > 0 && (
                            <ModernButton variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-1" />
                              Artifacts
                            </ModernButton>
                          )}
                          {build.status === 'failed' && (
                            <ModernButton variant="primary" size="sm">
                              <RotateCcw className="w-3 h-3 mr-1" />
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
              <h3 className="text-xl font-semibold mb-4">Pipeline Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Successful</p>
                  </div>
                  <p className="text-2xl font-bold">12,097</p>
                  <p className="text-xs text-green-600 mt-1">94.2% of builds</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium">Failed</p>
                  </div>
                  <p className="text-2xl font-bold">672</p>
                  <p className="text-xs text-red-600 mt-1">5.2% of builds</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Running</p>
                  </div>
                  <p className="text-2xl font-bold">78</p>
                  <p className="text-xs text-blue-600 mt-1">In progress</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Avg Coverage</p>
                  </div>
                  <p className="text-2xl font-bold">92.4%</p>
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
                <MiniKPI label="Total Builds" value="12,847" change={23.4} />
                <MiniKPI label="Success Rate" value="94.2%" change={5.7} />
                <MiniKPI label="Avg Duration" value="6.8m" change={-12.3} />
                <MiniKPI label="Active Pipelines" value="24" change={8.9} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Monthly Goal"
              value={12847}
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
                    <span className="text-xs font-semibold">12,097 (94.2%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '94.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <span className="text-xs font-semibold">672 (5.2%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: '5.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Running</span>
                    </div>
                    <span className="text-xs font-semibold">78 (0.6%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '0.6%' }} />
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
