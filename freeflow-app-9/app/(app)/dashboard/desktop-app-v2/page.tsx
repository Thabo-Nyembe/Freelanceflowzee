"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Monitor,
  Download,
  Users,
  Zap,
  TrendingUp,
  Settings,
  Package,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'

/**
 * Desktop App V2 - Groundbreaking Desktop Platform Management
 * Showcases desktop app features and deployment with modern components
 */
export default function DesktopAppV2() {
  const [selectedOS, setSelectedOS] = useState<'all' | 'windows' | 'macos' | 'linux'>('all')

  const stats = [
    { label: 'Total Installs', value: '89K', change: 28.5, icon: <Download className="w-5 h-5" /> },
    { label: 'Active Users', value: '42K', change: 22.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Update Rate', value: '94%', change: 15.7, icon: <RefreshCw className="w-5 h-5" /> },
    { label: 'Performance Score', value: '96', change: 8.2, icon: <Zap className="w-5 h-5" /> }
  ]

  const osStats = [
    {
      os: 'Windows',
      installs: 45000,
      users: 24000,
      version: '2.4.1',
      updateRate: 96,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      os: 'macOS',
      installs: 32000,
      users: 15000,
      version: '2.4.1',
      updateRate: 98,
      color: 'from-gray-500 to-slate-500'
    },
    {
      os: 'Linux',
      installs: 12000,
      users: 3000,
      version: '2.4.0',
      updateRate: 87,
      color: 'from-orange-500 to-amber-500'
    }
  ]

  const appFeatures = [
    {
      id: '1',
      title: 'Native Performance',
      description: 'Optimized for each platform',
      icon: <Zap className="w-8 h-8" />,
      status: 'stable',
      adoption: 98,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: '2',
      title: 'Auto Updates',
      description: 'Seamless background updates',
      icon: <RefreshCw className="w-8 h-8" />,
      status: 'stable',
      adoption: 94,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: '3',
      title: 'Offline Sync',
      description: 'Work without connection',
      icon: <Package className="w-8 h-8" />,
      status: 'beta',
      adoption: 67,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      title: 'Security Features',
      description: 'Enterprise-grade protection',
      icon: <Shield className="w-8 h-8" />,
      status: 'stable',
      adoption: 100,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const builds = [
    {
      version: '2.4.1',
      releaseDate: '3 days ago',
      buildNumber: '1247',
      status: 'stable',
      installs: 24700,
      issues: 2
    },
    {
      version: '2.4.0',
      releaseDate: '2 weeks ago',
      buildNumber: '1234',
      status: 'stable',
      installs: 47800,
      issues: 8
    },
    {
      version: '2.3.9',
      releaseDate: '1 month ago',
      buildNumber: '1198',
      status: 'deprecated',
      installs: 16500,
      issues: 0
    }
  ]

  const recentActivity = [
    { icon: <Package className="w-5 h-5" />, title: 'Build deployed', description: 'v2.4.1 for all platforms', time: '3 days ago', status: 'success' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Update completed', description: '94% users on latest version', time: '1 week ago', status: 'success' as const },
    { icon: <AlertTriangle className="w-5 h-5" />, title: 'Issue detected', description: 'Linux build performance lag', time: '2 weeks ago', status: 'warning' as const },
    { icon: <Download className="w-5 h-5" />, title: 'Install milestone', description: 'Reached 80K total installs', time: '3 weeks ago', status: 'success' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700'
      case 'beta': return 'bg-blue-100 text-blue-700'
      case 'deprecated': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxInstalls = Math.max(...osStats.map(os => os.installs))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Monitor className="w-10 h-10 text-gray-600" />
              Desktop App
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
          <PillButton variant={selectedOS === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedOS('all')}>
            All Platforms
          </PillButton>
          <PillButton variant={selectedOS === 'windows' ? 'primary' : 'ghost'} onClick={() => setSelectedOS('windows')}>
            Windows
          </PillButton>
          <PillButton variant={selectedOS === 'macos' ? 'primary' : 'ghost'} onClick={() => setSelectedOS('macos')}>
            macOS
          </PillButton>
          <PillButton variant={selectedOS === 'linux' ? 'primary' : 'ghost'} onClick={() => setSelectedOS('linux')}>
            Linux
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Platform Distribution</h3>
          <div className="space-y-6">
            {osStats.map((platform) => {
              const installPercent = (platform.installs / maxInstalls) * 100

              return (
                <div key={platform.os} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{platform.os}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Installs</p>
                        <p className="font-bold">{(platform.installs / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-bold">{(platform.users / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-bold">{platform.version}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Update Rate</p>
                        <p className="font-bold text-green-600">{platform.updateRate}%</p>
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
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">App Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appFeatures.map((feature) => (
                  <div key={feature.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{feature.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(feature.status)}`}>
                            {feature.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Adoption</span>
                            <span className="font-semibold">{feature.adoption}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${feature.color}`}
                              style={{ width: `${feature.adoption}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Build History</h3>
              <div className="space-y-3">
                {builds.map((build) => (
                  <div key={build.version} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Version {build.version}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(build.status)}`}>
                            {build.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Build #{build.buildNumber}</span>
                          <span>Released {build.releaseDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{(build.installs / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-muted-foreground">installs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {build.issues > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          {build.issues} known issues
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          No issues reported
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Install Target"
              current={89000}
              goal={150000}
              unit=""
              icon={<Download className="w-5 h-5" />}
            />

            <ProgressCard
              title="Update Coverage"
              current={94}
              goal={100}
              unit="%"
              icon={<RefreshCw className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Startup Time" value="1.2s" change={-15.3} />
                <MiniKPI label="Memory Usage" value="247MB" change={-8.7} />
                <MiniKPI label="Crash Rate" value="0.02%" change={-42.5} />
                <MiniKPI label="User Satisfaction" value="4.7/5" change={12.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
