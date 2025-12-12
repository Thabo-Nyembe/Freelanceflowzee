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
  Users,
  Code,
  Package,
  Tag,
  Calendar,
  Zap,
  Settings,
  Play,
  Pause
} from 'lucide-react'

/**
 * Releases V2 - Groundbreaking Release Management
 * Showcases software releases, deployments, and version control
 */
export default function ReleasesV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'deployed' | 'scheduled' | 'rolling'>('all')

  const stats = [
    { label: 'Total Releases', value: '247', change: 28.4, icon: <Rocket className="w-5 h-5" /> },
    { label: 'Success Rate', value: '98.4%', change: 12.5, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Deploy Time', value: '8.2min', change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Deployments', value: '14', change: 42.3, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const releases = [
    {
      id: '1',
      version: 'v3.2.0',
      name: 'AI Assistant Enhancement',
      status: 'deployed',
      environment: 'production',
      deployedAt: '2024-02-10',
      commits: 124,
      contributors: 8,
      deployTime: 7.2,
      coverage: 100,
      rollbackRate: 0,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '2',
      version: 'v3.1.5',
      name: 'Performance Optimization',
      status: 'rolling',
      environment: 'production',
      deployedAt: '2024-02-12',
      commits: 67,
      contributors: 5,
      deployTime: 12.5,
      coverage: 45,
      rollbackRate: 0,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      version: 'v3.3.0',
      name: 'New Dashboard Features',
      status: 'scheduled',
      environment: 'production',
      deployedAt: '2024-02-20',
      commits: 89,
      contributors: 12,
      deployTime: 0,
      coverage: 0,
      rollbackRate: 0,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      version: 'v3.0.2',
      name: 'Bug Fixes & Security Patches',
      status: 'deployed',
      environment: 'production',
      deployedAt: '2024-01-28',
      commits: 34,
      contributors: 4,
      deployTime: 6.8,
      coverage: 100,
      rollbackRate: 0,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      version: 'v2.9.8',
      name: 'Legacy Support Update',
      status: 'deployed',
      environment: 'production',
      deployedAt: '2024-01-15',
      commits: 12,
      contributors: 2,
      deployTime: 4.5,
      coverage: 100,
      rollbackRate: 0,
      color: 'from-gray-500 to-slate-500'
    }
  ]

  const deployments = [
    {
      id: '1',
      release: 'v3.2.0',
      environment: 'Production',
      status: 'success',
      startedAt: '2024-02-10 14:32',
      duration: 7.2,
      servers: 24,
      health: 100
    },
    {
      id: '2',
      release: 'v3.1.5',
      environment: 'Production',
      status: 'in_progress',
      startedAt: '2024-02-12 09:15',
      duration: 12.5,
      servers: 24,
      health: 85
    },
    {
      id: '3',
      release: 'v3.2.0',
      environment: 'Staging',
      status: 'success',
      startedAt: '2024-02-09 16:45',
      duration: 5.8,
      servers: 8,
      health: 100
    },
    {
      id: '4',
      release: 'v3.0.2',
      environment: 'Production',
      status: 'success',
      startedAt: '2024-01-28 11:20',
      duration: 6.8,
      servers: 24,
      health: 100
    }
  ]

  const changelog = [
    {
      version: 'v3.2.0',
      changes: [
        { type: 'feature', description: 'Added AI-powered content suggestions' },
        { type: 'feature', description: 'Improved dashboard performance by 40%' },
        { type: 'fix', description: 'Fixed memory leak in analytics module' },
        { type: 'enhancement', description: 'Updated UI components library' }
      ]
    },
    {
      version: 'v3.1.5',
      changes: [
        { type: 'feature', description: 'Real-time collaboration features' },
        { type: 'fix', description: 'Resolved authentication timeout issues' },
        { type: 'enhancement', description: 'Optimized database queries' }
      ]
    }
  ]

  const topReleases = [
    { rank: 1, name: 'v3.2.0 AI Enhancement', avatar: '🤖', value: '124', change: 42.3 },
    { rank: 2, name: 'v3.3.0 Dashboard', avatar: '📊', value: '89', change: 35.1 },
    { rank: 3, name: 'v3.1.5 Performance', avatar: '⚡', value: '67', change: 28.5 },
    { rank: 4, name: 'v3.0.2 Bug Fixes', avatar: '🐛', value: '34', change: 22.7 },
    { rank: 5, name: 'v2.9.8 Legacy', avatar: '📦', value: '12', change: 18.2 }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Release deployed', description: 'v3.2.0 to Production - 100% coverage', time: '2 days ago', status: 'success' as const },
    { icon: <Rocket className="w-5 h-5" />, title: 'Rolling deployment', description: 'v3.1.5 at 45% coverage', time: '1 hour ago', status: 'info' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Release scheduled', description: 'v3.3.0 for Feb 20, 2024', time: '3 days ago', status: 'info' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Rollback executed', description: 'v3.0.1 rolled back due to errors', time: '1 week ago', status: 'warning' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-700'
      case 'rolling': return 'bg-blue-100 text-blue-700'
      case 'scheduled': return 'bg-purple-100 text-purple-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'success': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-3 h-3" />
      case 'rolling': return <Play className="w-3 h-3" />
      case 'scheduled': return <Calendar className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'in_progress': return <Clock className="w-3 h-3" />
      default: return <Rocket className="w-3 h-3" />
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-700'
      case 'fix': return 'bg-red-100 text-red-700'
      case 'enhancement': return 'bg-blue-100 text-blue-700'
      case 'breaking': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxCommits = Math.max(...releases.map(r => r.commits))

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

        <StatGrid columns={4} stats={stats} />

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
                {releases.map((release) => {
                  const commitPercent = (release.commits / maxCommits) * 100

                  return (
                    <div key={release.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${release.color} flex items-center justify-center text-white font-mono font-bold text-sm`}>
                                {release.version.replace('v', '')}
                              </div>
                              <div>
                                <h4 className="font-semibold">{release.name}</h4>
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
                              <p className="text-2xl font-bold text-indigo-600">{release.coverage}%</p>
                              <p className="text-xs text-muted-foreground">Coverage</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Commits</p>
                            <p className="font-semibold">{release.commits}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Contributors</p>
                            <p className="font-semibold">{release.contributors}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              {release.status === 'scheduled' ? 'Scheduled' : 'Deployed'}
                            </p>
                            <p className="font-semibold">{release.deployedAt}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deploy Time</p>
                            <p className="font-semibold">
                              {release.deployTime > 0 ? `${release.deployTime}min` : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {release.status === 'rolling' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Rollout Progress</span>
                              <span className="font-semibold">{release.coverage}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${release.color}`}
                                style={{ width: `${release.coverage}%` }}
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
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Rollback', release.id)}>
                              Rollback
                            </ModernButton>
                          )}
                          {release.status === 'rolling' && (
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Pause', release.id)}>
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Recent Deployments</h3>
              <div className="space-y-2">
                {deployments.map((deployment) => (
                  <div key={deployment.id} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(deployment.status)}`}>
                            {getStatusIcon(deployment.status)}
                            {deployment.status.replace('_', ' ')}
                          </span>
                          <code className="text-sm font-mono font-semibold">{deployment.release}</code>
                          <span className="text-xs text-muted-foreground">→ {deployment.environment}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {deployment.startedAt}
                          </span>
                          <span>{deployment.duration}min</span>
                          <span>{deployment.servers} servers</span>
                          <span className={deployment.health === 100 ? 'text-green-600' : 'text-yellow-600'}>
                            {deployment.health}% healthy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Changelog</h3>
              <div className="space-y-4">
                {changelog.map((log) => (
                  <div key={log.version} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <code className="font-mono font-semibold">{log.version}</code>
                    </div>
                    <div className="pl-6 space-y-1">
                      {log.changes.map((change, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className={`text-xs px-2 py-0.5 rounded-md ${getChangeTypeColor(change.type)} flex-shrink-0 mt-0.5`}>
                            {change.type}
                          </span>
                          <span className="text-muted-foreground">{change.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Releases" items={topReleases} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Release Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Deploy Frequency" value="4.2/week" change={28.4} />
                <MiniKPI label="Lead Time" value="2.1 days" change={-18.7} />
                <MiniKPI label="MTTR" value="12min" change={-35.2} />
                <MiniKPI label="Change Fail Rate" value="1.6%" change={-12.5} />
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
