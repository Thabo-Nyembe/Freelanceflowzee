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
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Rocket,
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Package,
  Tag,
  Calendar,
  Settings,
  Play,
  Pause
} from 'lucide-react'
import { useReleases, useReleaseStats, type Release } from '@/lib/hooks/use-releases'
import { deployRelease, rollbackRelease, pauseRollingDeployment } from '@/app/actions/releases'

interface ReleasesClientProps {
  initialReleases: Release[]
}

export default function ReleasesClient({ initialReleases }: ReleasesClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'deployed' | 'scheduled' | 'rolling'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Use hooks for real-time data
  const { data: releases } = useReleases({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    searchQuery: searchQuery || undefined
  })
  const { stats } = useReleaseStats()

  const displayReleases = releases || initialReleases

  const filteredReleases = selectedStatus === 'all'
    ? displayReleases
    : displayReleases.filter(release => release.status === selectedStatus)

  const statItems = [
    { label: 'Total Releases', value: stats?.totalReleases?.toString() || displayReleases.length.toString(), change: 28.4, icon: <Rocket className="w-5 h-5" /> },
    { label: 'Success Rate', value: stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%', change: 12.5, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Deploy Time', value: stats?.averageDeployTime ? `${stats.averageDeployTime.toFixed(1)}min` : '0min', change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Total Commits', value: stats?.totalCommits?.toString() || '0', change: 42.3, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const topReleases = displayReleases
    .sort((a, b) => b.commits_count - a.commits_count)
    .slice(0, 5)
    .map((release, index) => ({
      rank: index + 1,
      name: `${release.version} ${release.release_name}`,
      avatar: release.status === 'deployed' ? '✅' : release.status === 'rolling' ? '⚡' : '📅',
      value: release.commits_count.toString(),
      change: 0
    }))

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Release deployed', description: 'to Production', time: '2 days ago', status: 'success' as const },
    { icon: <Rocket className="w-5 h-5" />, title: 'Rolling deployment', description: 'in progress', time: '1 hour ago', status: 'info' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Release scheduled', description: 'for next week', time: '3 days ago', status: 'info' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Rollback executed', description: 'due to errors', time: '1 week ago', status: 'warning' as const }
  ]

  const maxCommits = Math.max(...displayReleases.map(r => r.commits_count), 1)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-700'
      case 'rolling': return 'bg-blue-100 text-blue-700'
      case 'scheduled': return 'bg-purple-100 text-purple-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-3 h-3" />
      case 'rolling': return <Play className="w-3 h-3" />
      case 'scheduled': return <Calendar className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      default: return <Rocket className="w-3 h-3" />
    }
  }

  const getGradientColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'from-green-500 to-emerald-500'
      case 'rolling': return 'from-blue-500 to-cyan-500'
      case 'scheduled': return 'from-purple-500 to-pink-500'
      case 'failed': return 'from-red-500 to-orange-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const handleDeploy = async (releaseId: string) => {
    await deployRelease(releaseId)
  }

  const handleRollback = async (releaseId: string) => {
    await rollbackRelease(releaseId)
  }

  const handlePause = async (releaseId: string) => {
    await pauseRollingDeployment(releaseId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Rocket className="w-10 h-10 text-indigo-600" />
              Release Management
            </h1>
            <p className="text-muted-foreground">Track deployments, versions, and rollouts</p>
          </div>
          <GradientButton from="indigo" to="purple" onClick={() => console.log('New release')}>
            <Rocket className="w-5 h-5 mr-2" />
            Create Release
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Rocket />} title="Releases" description="All versions" onClick={() => console.log('Releases')} />
          <BentoQuickAction icon={<GitBranch />} title="Branches" description="Git workflow" onClick={() => console.log('Branches')} />
          <BentoQuickAction icon={<Package />} title="Artifacts" description="Build packages" onClick={() => console.log('Artifacts')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Releases
          </PillButton>
          <PillButton variant={selectedStatus === 'deployed' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('deployed')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Deployed
          </PillButton>
          <PillButton variant={selectedStatus === 'rolling' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('rolling')}>
            <Play className="w-4 h-4 mr-2" />
            Rolling Out
          </PillButton>
          <PillButton variant={selectedStatus === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('scheduled')}>
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Recent Releases</h3>
              <div className="space-y-3">
                {filteredReleases.map((release) => (
                  <div key={release.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getGradientColor(release.status)} flex items-center justify-center text-white font-mono font-bold text-sm`}>
                              {release.version.replace('v', '').split('.')[0]}
                            </div>
                            <div>
                              <h4 className="font-semibold">{release.release_name}</h4>
                              <code className="text-xs font-mono text-muted-foreground">{release.version}</code>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(release.status)}`}>
                              {getStatusIcon(release.status)}
                              {release.status}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-md bg-muted">
                              {release.environment}
                            </span>
                          </div>
                        </div>
                        {release.status === 'rolling' && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">{release.coverage_percentage}%</p>
                            <p className="text-xs text-muted-foreground">Coverage</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Commits</p>
                          <p className="font-semibold">{release.commits_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contributors</p>
                          <p className="font-semibold">{release.contributors_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {release.status === 'scheduled' ? 'Scheduled' : 'Deployed'}
                          </p>
                          <p className="font-semibold">
                            {release.deployed_at
                              ? new Date(release.deployed_at).toLocaleDateString()
                              : release.scheduled_for
                              ? new Date(release.scheduled_for).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deploy Time</p>
                          <p className="font-semibold">
                            {release.deploy_time_minutes ? `${release.deploy_time_minutes.toFixed(1)}min` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {release.status === 'rolling' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Rollout Progress</span>
                            <span className="font-semibold">{release.coverage_percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getGradientColor(release.status)}`}
                              style={{ width: `${release.coverage_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', release.id)}>
                          <Tag className="w-3 h-3 mr-1" />
                          View
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Changelog', release.id)}>
                          Changelog
                        </ModernButton>
                        {release.status === 'deployed' && (
                          <ModernButton variant="outline" size="sm" onClick={() => handleRollback(release.id)}>
                            Rollback
                          </ModernButton>
                        )}
                        {release.status === 'rolling' && (
                          <ModernButton variant="outline" size="sm" onClick={() => handlePause(release.id)}>
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </ModernButton>
                        )}
                        {release.status === 'scheduled' && (
                          <ModernButton variant="primary" size="sm" onClick={() => handleDeploy(release.id)}>
                            <Rocket className="w-3 h-3 mr-1" />
                            Deploy
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Release Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Deployed</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.deployedReleases || 0}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Rolling</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.rollingReleases || 0}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Scheduled</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.scheduledReleases || 0}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium">Failed</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.failedReleases || 0}</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Releases" items={topReleases} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Release Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Deploy Frequency" value={`${((stats?.totalReleases || 0) / 4).toFixed(1)}/week`} change={28.4} />
                <MiniKPI label="Success Rate" value={`${(stats?.successRate || 0).toFixed(1)}%`} change={12.5} />
                <MiniKPI label="Avg Deploy Time" value={`${(stats?.averageDeployTime || 0).toFixed(1)}min`} change={-18.7} />
                <MiniKPI label="Total Commits" value={stats?.totalCommits?.toString() || '0'} change={42.3} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Schedule')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Release
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Branches')}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  View Branches
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Builds')}>
                  <Package className="w-4 h-4 mr-2" />
                  Build Artifacts
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
