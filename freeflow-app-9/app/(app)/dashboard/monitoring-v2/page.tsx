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
  Activity,
  Server,
  Cpu,
  HardDrive,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Globe,
  BarChart3,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

/**
 * Monitoring V2 - System Monitoring Dashboard
 * Real-time monitoring of servers, services, and infrastructure
 */
export default function MonitoringV2() {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'cpu' | 'memory' | 'disk' | 'network'>('all')

  const stats = [
    { label: 'Uptime', value: '99.98%', change: 0.2, icon: <Activity className="w-5 h-5" /> },
    { label: 'Active Servers', value: '247', change: 2.1, icon: <Server className="w-5 h-5" /> },
    { label: 'Avg Response', value: '42ms', change: -15.3, icon: <Zap className="w-5 h-5" /> },
    { label: 'Total Requests', value: '8.4M', change: 23.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const servers = [
    {
      id: 'srv-001',
      name: 'Web Server 01',
      type: 'production',
      status: 'healthy',
      cpu: 45,
      memory: 62,
      disk: 38,
      network: 124,
      uptime: 99.99,
      location: 'US East',
      requests: 1247000,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'srv-002',
      name: 'Web Server 02',
      type: 'production',
      status: 'healthy',
      cpu: 52,
      memory: 58,
      disk: 41,
      network: 189,
      uptime: 99.98,
      location: 'US West',
      requests: 1089000,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'srv-003',
      name: 'Database Primary',
      type: 'database',
      status: 'warning',
      cpu: 78,
      memory: 85,
      disk: 72,
      network: 267,
      uptime: 99.95,
      location: 'US East',
      requests: 2847000,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'srv-004',
      name: 'API Gateway',
      type: 'production',
      status: 'healthy',
      cpu: 34,
      memory: 48,
      disk: 29,
      network: 342,
      uptime: 99.99,
      location: 'EU West',
      requests: 3421000,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'srv-005',
      name: 'Cache Server',
      type: 'cache',
      status: 'healthy',
      cpu: 28,
      memory: 91,
      disk: 15,
      network: 89,
      uptime: 99.97,
      location: 'US East',
      requests: 892000,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'srv-006',
      name: 'Background Worker',
      type: 'worker',
      status: 'healthy',
      cpu: 67,
      memory: 54,
      disk: 23,
      network: 45,
      uptime: 99.96,
      location: 'US West',
      requests: 567000,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'srv-007',
      name: 'Load Balancer',
      type: 'network',
      status: 'healthy',
      cpu: 12,
      memory: 22,
      disk: 8,
      network: 1247,
      uptime: 100.0,
      location: 'Global',
      requests: 8473000,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'srv-008',
      name: 'Storage Server',
      type: 'storage',
      status: 'critical',
      cpu: 89,
      memory: 95,
      disk: 94,
      network: 178,
      uptime: 98.42,
      location: 'US East',
      requests: 423000,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const topServers = [
    { rank: 1, name: 'Load Balancer', avatar: 'LB', value: '8.47M', change: 42.3 },
    { rank: 2, name: 'API Gateway', avatar: 'AG', value: '3.42M', change: 32.1 },
    { rank: 3, name: 'Database Primary', avatar: 'DB', value: '2.85M', change: 28.7 },
    { rank: 4, name: 'Web Server 01', avatar: 'W1', value: '1.25M', change: 24.5 },
    { rank: 5, name: 'Web Server 02', avatar: 'W2', value: '1.09M', change: 18.9 }
  ]

  const recentActivity = [
    { icon: <AlertTriangle className="w-4 h-4" />, title: 'High CPU on Storage Server', time: '5m ago', type: 'error' as const },
    { icon: <CheckCircle className="w-4 h-4" />, title: 'All servers responding', time: '1h ago', type: 'success' as const },
    { icon: <Server className="w-4 h-4" />, title: 'New server provisioned', time: '3h ago', type: 'info' as const },
    { icon: <Database className="w-4 h-4" />, title: 'Database backup completed', time: '6h ago', type: 'success' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Healthy' }
      case 'warning':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertTriangle className="w-3 h-3" />, label: 'Warning' }
      case 'critical':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <AlertTriangle className="w-3 h-3" />, label: 'Critical' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <Server className="w-3 h-3" />, label: status }
    }
  }

  const getMetricColor = (value: number, metric: string) => {
    if (metric === 'uptime') {
      if (value >= 99.9) return 'text-green-600'
      if (value >= 99.0) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (value >= 90) return 'text-red-600'
    if (value >= 75) return 'text-yellow-600'
    if (value >= 50) return 'text-blue-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10 text-slate-600" />
              System Monitoring
            </h1>
            <p className="text-muted-foreground">Real-time infrastructure monitoring and alerts</p>
          </div>
          <div className="flex items-center gap-2">
            <ModernButton variant="outline" onClick={() => console.log('Refresh')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </ModernButton>
            <GradientButton from="slate" to="gray" onClick={() => console.log('Export')}>
              <Download className="w-5 h-5 mr-2" />
              Export Metrics
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Cpu />} title="CPU" description="Usage" onClick={() => setSelectedMetric('cpu')} />
          <BentoQuickAction icon={<Activity />} title="Memory" description="RAM usage" onClick={() => setSelectedMetric('memory')} />
          <BentoQuickAction icon={<HardDrive />} title="Disk" description="Storage" onClick={() => setSelectedMetric('disk')} />
          <BentoQuickAction icon={<Globe />} title="Network" description="Traffic" onClick={() => setSelectedMetric('network')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedMetric === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedMetric('all')}>
            All Metrics
          </PillButton>
          <PillButton variant={selectedMetric === 'cpu' ? 'primary' : 'ghost'} onClick={() => setSelectedMetric('cpu')}>
            <Cpu className="w-4 h-4 mr-2" />
            CPU
          </PillButton>
          <PillButton variant={selectedMetric === 'memory' ? 'primary' : 'ghost'} onClick={() => setSelectedMetric('memory')}>
            <Activity className="w-4 h-4 mr-2" />
            Memory
          </PillButton>
          <PillButton variant={selectedMetric === 'disk' ? 'primary' : 'ghost'} onClick={() => setSelectedMetric('disk')}>
            <HardDrive className="w-4 h-4 mr-2" />
            Disk
          </PillButton>
          <PillButton variant={selectedMetric === 'network' ? 'primary' : 'ghost'} onClick={() => setSelectedMetric('network')}>
            <Globe className="w-4 h-4 mr-2" />
            Network
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Server Status</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search servers..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {servers.map((server) => {
                  const statusBadge = getStatusBadge(server.status)

                  return (
                    <div key={server.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{server.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                {statusBadge.icon}
                                {statusBadge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{server.id}</span>
                              <span>•</span>
                              <span>{server.type}</span>
                              <span>•</span>
                              <span>{server.location}</span>
                              <span>•</span>
                              <span className={getMetricColor(server.uptime, 'uptime')}>{server.uptime}% uptime</span>
                            </div>
                          </div>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1 text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Cpu className="w-3 h-3" />
                                CPU
                              </span>
                              <span className={`font-semibold ${getMetricColor(server.cpu, 'cpu')}`}>{server.cpu}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${server.color}`}
                                style={{ width: `${server.cpu}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1 text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                RAM
                              </span>
                              <span className={`font-semibold ${getMetricColor(server.memory, 'memory')}`}>{server.memory}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${server.color}`}
                                style={{ width: `${server.memory}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1 text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                Disk
                              </span>
                              <span className={`font-semibold ${getMetricColor(server.disk, 'disk')}`}>{server.disk}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${server.color}`}
                                style={{ width: `${server.disk}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1 text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                Network
                              </span>
                              <span className="font-semibold text-blue-600">{server.network} MB/s</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${server.color}`}
                                style={{ width: `${Math.min((server.network / 500) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t text-xs">
                          <div className="text-muted-foreground">
                            {(server.requests / 1000).toFixed(1)}K requests/hour
                          </div>
                          <div className="flex items-center gap-2">
                            <ModernButton variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </ModernButton>
                            <ModernButton variant="outline" size="sm">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Metrics
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Resource Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Avg CPU</p>
                  </div>
                  <p className="text-2xl font-bold">51%</p>
                  <p className="text-xs text-blue-600 mt-1">Normal range</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Avg Memory</p>
                  </div>
                  <p className="text-2xl font-bold">64%</p>
                  <p className="text-xs text-purple-600 mt-1">Good capacity</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Avg Disk</p>
                  </div>
                  <p className="text-2xl font-bold">40%</p>
                  <p className="text-xs text-green-600 mt-1">Plenty of space</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Network</p>
                  </div>
                  <p className="text-2xl font-bold">289 MB/s</p>
                  <p className="text-xs text-orange-600 mt-1">Avg throughput</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="📊 Most Active" items={topServers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Uptime" value="99.98%" change={0.2} />
                <MiniKPI label="Active Servers" value="247" change={2.1} />
                <MiniKPI label="Avg Response" value="42ms" change={-15.3} />
                <MiniKPI label="Total Requests" value="8.4M" change={23.7} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Alerts" activities={recentActivity} />

            <ProgressCard
              title="Capacity"
              value={64}
              target={80}
              label="Average resource usage"
              color="from-slate-500 to-gray-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Server Health</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Healthy</span>
                    </div>
                    <span className="text-xs font-semibold">234 (95%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '95%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Warning</span>
                    </div>
                    <span className="text-xs font-semibold">12 (5%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: '5%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Critical</span>
                    </div>
                    <span className="text-xs font-semibold">1 (0.4%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: '0.4%' }} />
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
