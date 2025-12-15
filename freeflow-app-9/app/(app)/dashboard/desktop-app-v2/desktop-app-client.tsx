'use client'

import { useState } from 'react'
import { useDesktopApps, type DesktopApp, type Platform, type BuildStatus } from '@/lib/hooks/use-desktop-apps'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ProgressCard, ActivityFeed } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Monitor, Download, Users, Zap, RefreshCw, Settings, Package, CheckCircle, AlertTriangle } from 'lucide-react'

export default function DesktopAppClient({ initialApps }: { initialApps: DesktopApp[] }) {
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')
  const { desktopApps, loading, error } = useDesktopApps({ platform: platformFilter })

  const displayApps = desktopApps.length > 0 ? desktopApps : initialApps

  const stats = [
    {
      label: 'Total Installs',
      value: displayApps.reduce((sum, app) => sum + app.total_installs, 0).toLocaleString(),
      change: 28.5,
      icon: <Download className="w-5 h-5" />
    },
    {
      label: 'Active Users',
      value: displayApps.reduce((sum, app) => sum + app.active_users, 0).toLocaleString(),
      change: 22.3,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Avg Update Rate',
      value: displayApps.length > 0
        ? `${(displayApps.reduce((sum, app) => sum + app.update_rate, 0) / displayApps.length).toFixed(0)}%`
        : '0%',
      change: 15.7,
      icon: <RefreshCw className="w-5 h-5" />
    },
    {
      label: 'Avg Performance',
      value: displayApps.length > 0
        ? (displayApps.reduce((sum, app) => sum + app.performance_score, 0) / displayApps.length).toFixed(0)
        : '0',
      change: 8.2,
      icon: <Zap className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: BuildStatus) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700'
      case 'beta': return 'bg-blue-100 text-blue-700'
      case 'deprecated': return 'bg-gray-100 text-gray-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'building': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'windows': return 'from-blue-500 to-cyan-500'
      case 'macos': return 'from-gray-500 to-slate-500'
      case 'linux': return 'from-orange-500 to-amber-500'
      default: return 'from-purple-500 to-pink-500'
    }
  }

  const totalInstalls = displayApps.reduce((sum, app) => sum + app.total_installs, 0)
  const platformStats = [
    {
      os: 'Windows',
      installs: displayApps.reduce((sum, app) => sum + app.windows_installs, 0),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      os: 'macOS',
      installs: displayApps.reduce((sum, app) => sum + app.macos_installs, 0),
      color: 'from-gray-500 to-slate-500'
    },
    {
      os: 'Linux',
      installs: displayApps.reduce((sum, app) => sum + app.linux_installs, 0),
      color: 'from-orange-500 to-amber-500'
    }
  ]

  const maxInstalls = Math.max(...platformStats.map(p => p.installs))

  const recentActivity = displayApps.slice(0, 4).map((app) => ({
    icon: app.build_status === 'stable' ? <CheckCircle className="w-5 h-5" /> : <Package className="w-5 h-5" />,
    title: app.build_status === 'stable' ? 'Build deployed' : 'Build updated',
    description: `${app.app_name} v${app.app_version}`,
    time: new Date(app.updated_at).toLocaleDateString(),
    status: (app.build_status === 'stable' ? 'success' : app.build_status === 'failed' ? 'error' : 'info') as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Monitor className="w-10 h-10 text-gray-600" />
              Desktop Apps
            </h1>
            <p className="text-muted-foreground">Manage desktop applications and deployments</p>
          </div>
          <GradientButton from="gray" to="slate" onClick={() => console.log('Deploy')}>
            <Package className="w-5 h-5 mr-2" />
            Deploy Build
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Package />} title="New Build" description="Create release" onClick={() => console.log('Build')} />
          <BentoQuickAction icon={<Download />} title="Downloads" description="Track installs" onClick={() => console.log('Downloads')} />
          <BentoQuickAction icon={<RefreshCw />} title="Updates" description="Push update" onClick={() => console.log('Update')} />
          <BentoQuickAction icon={<Settings />} title="Config" description="Settings" onClick={() => console.log('Config')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={platformFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setPlatformFilter('all')}>
            All Platforms
          </PillButton>
          <PillButton variant={platformFilter === 'windows' ? 'primary' : 'ghost'} onClick={() => setPlatformFilter('windows')}>
            Windows
          </PillButton>
          <PillButton variant={platformFilter === 'macos' ? 'primary' : 'ghost'} onClick={() => setPlatformFilter('macos')}>
            macOS
          </PillButton>
          <PillButton variant={platformFilter === 'linux' ? 'primary' : 'ghost'} onClick={() => setPlatformFilter('linux')}>
            Linux
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Platform Distribution</h3>
          <div className="space-y-6">
            {platformStats.map((platform) => {
              const installPercent = maxInstalls > 0 ? (platform.installs / maxInstalls) * 100 : 0

              return (
                <div key={platform.os} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{platform.os}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Installs</p>
                        <p className="font-bold">{(platform.installs / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${platform.color} transition-all duration-300`}
                      style={{ width: `${installPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayApps.map((app) => (
              <BentoCard key={app.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{app.app_name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(app.build_status)}`}>
                        {app.build_status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Version {app.app_version}</p>
                    {app.build_number && (
                      <p className="text-xs text-muted-foreground">Build #{app.build_number}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-600">{app.total_installs.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Installs</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Active Users</p>
                    <p className="font-semibold">{app.active_users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Update Rate</p>
                    <p className="font-semibold text-green-600">{app.update_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Performance</p>
                    <p className="font-semibold">{app.performance_score.toFixed(0)}/100</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User Rating</p>
                    <p className="font-semibold">{app.user_rating.toFixed(1)}/5</p>
                  </div>
                </div>

                {app.known_issues > 0 && (
                  <div className="flex items-center gap-2 text-xs mb-3">
                    {app.critical_bugs > 0 ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        {app.critical_bugs} critical bugs
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle className="w-3 h-3" />
                        {app.known_issues} known issues
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <ModernButton variant="primary" size="sm">View Details</ModernButton>
                  {app.download_url && (
                    <ModernButton variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </ModernButton>
                  )}
                </div>
              </BentoCard>
            ))}

            {displayApps.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Desktop Apps</h3>
                <p className="text-muted-foreground">Deploy your first desktop application</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Install Target"
              current={totalInstalls}
              goal={150000}
              unit=""
              icon={<Download className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI
                  label="Avg Startup"
                  value={displayApps.length > 0
                    ? `${(displayApps.reduce((sum, app) => sum + app.startup_time_ms, 0) / displayApps.length / 1000).toFixed(1)}s`
                    : '0s'}
                  change={-15.3}
                />
                <MiniKPI
                  label="Avg Memory"
                  value={displayApps.length > 0
                    ? `${(displayApps.reduce((sum, app) => sum + app.memory_usage_mb, 0) / displayApps.length).toFixed(0)}MB`
                    : '0MB'}
                  change={-8.7}
                />
                <MiniKPI
                  label="Crash Rate"
                  value={displayApps.length > 0
                    ? `${(displayApps.reduce((sum, app) => sum + app.crash_rate, 0) / displayApps.length).toFixed(2)}%`
                    : '0%'}
                  change={-42.5}
                />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
