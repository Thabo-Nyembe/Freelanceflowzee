'use client'

import { useState } from 'react'
import { useServers, useSystemAlerts, useServerMutations, useAlertMutations, Server, SystemAlert } from '@/lib/hooks/use-monitoring'
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
  Server as ServerIcon,
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

interface MonitoringClientProps {
  initialServers: Server[]
  initialAlerts: SystemAlert[]
}

export default function MonitoringClient({ initialServers, initialAlerts }: MonitoringClientProps) {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'cpu' | 'memory' | 'disk' | 'network'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { servers, stats, isLoading, refetch } = useServers(initialServers, { status: selectedMetric === 'all' ? undefined : undefined })
  const { alerts } = useSystemAlerts(initialAlerts)
  const { createServer, updateServer, deleteServer, isCreating } = useServerMutations()
  const { acknowledgeAlert, resolveAlert } = useAlertMutations()

  const filteredServers = servers.filter(server =>
    server.server_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statItems = [
    { label: 'Uptime', value: `${stats.avgUptime}%`, change: 0.2, icon: <Activity className="w-5 h-5" /> },
    { label: 'Active Servers', value: stats.total.toString(), change: 2.1, icon: <ServerIcon className="w-5 h-5" /> },
    { label: 'Healthy', value: stats.healthy.toString(), change: 5.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Critical', value: stats.critical.toString(), change: stats.critical > 0 ? -10 : 0, icon: <AlertTriangle className="w-5 h-5" /> }
  ]

  const topServers = servers
    .sort((a, b) => b.requests_per_hour - a.requests_per_hour)
    .slice(0, 5)
    .map((server, index) => ({
      rank: index + 1,
      name: server.server_name,
      avatar: server.server_name.substring(0, 2).toUpperCase(),
      value: `${(server.requests_per_hour / 1000).toFixed(1)}K`,
      change: Math.random() * 20
    }))

  const recentActivity = alerts.slice(0, 4).map(alert => ({
    icon: alert.severity === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />,
    title: alert.title,
    time: new Date(alert.created_at).toLocaleTimeString(),
    type: alert.severity === 'critical' ? 'error' as const : alert.severity === 'warning' ? 'warning' as const : 'success' as const
  }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Healthy' }
      case 'warning':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertTriangle className="w-3 h-3" />, label: 'Warning' }
      case 'critical':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <AlertTriangle className="w-3 h-3" />, label: 'Critical' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <ServerIcon className="w-3 h-3" />, label: status }
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

  const getServerGradient = (status: string) => {
    switch (status) {
      case 'healthy': return 'from-green-500 to-emerald-500'
      case 'warning': return 'from-yellow-500 to-amber-500'
      case 'critical': return 'from-red-500 to-orange-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
            <ModernButton variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </ModernButton>
            <GradientButton from="slate" to="gray" onClick={() => console.log('Export')}>
              <Download className="w-5 h-5 mr-2" />
              Export Metrics
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statItems} />

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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading servers...</div>
                ) : filteredServers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No servers found</div>
                ) : (
                  filteredServers.map((server) => {
                    const statusBadge = getStatusBadge(server.status)
                    const gradient = getServerGradient(server.status)

                    return (
                      <div key={server.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{server.server_name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{server.id.substring(0, 8)}</span>
                                <span>•</span>
                                <span>{server.server_type}</span>
                                <span>•</span>
                                <span>{server.location || 'Unknown'}</span>
                                <span>•</span>
                                <span className={getMetricColor(Number(server.uptime_percentage), 'uptime')}>{server.uptime_percentage}% uptime</span>
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
                                <span className={`font-semibold ${getMetricColor(Number(server.cpu_usage), 'cpu')}`}>{server.cpu_usage}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradient}`}
                                  style={{ width: `${server.cpu_usage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  RAM
                                </span>
                                <span className={`font-semibold ${getMetricColor(Number(server.memory_usage), 'memory')}`}>{server.memory_usage}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradient}`}
                                  style={{ width: `${server.memory_usage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  Disk
                                </span>
                                <span className={`font-semibold ${getMetricColor(Number(server.disk_usage), 'disk')}`}>{server.disk_usage}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradient}`}
                                  style={{ width: `${server.disk_usage}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Network
                                </span>
                                <span className="font-semibold text-blue-600">{server.network_throughput} MB/s</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradient}`}
                                  style={{ width: `${Math.min((Number(server.network_throughput) / 500) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t text-xs">
                            <div className="text-muted-foreground">
                              {(server.requests_per_hour / 1000).toFixed(1)}K requests/hour
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
                  })
                )}
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
                  <p className="text-2xl font-bold">{stats.avgCpu}%</p>
                  <p className="text-xs text-blue-600 mt-1">Normal range</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Avg Memory</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgMemory}%</p>
                  <p className="text-xs text-purple-600 mt-1">Good capacity</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Avg Disk</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgDisk}%</p>
                  <p className="text-xs text-green-600 mt-1">Plenty of space</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Total Requests</p>
                  </div>
                  <p className="text-2xl font-bold">{(stats.totalRequests / 1000).toFixed(0)}K/hr</p>
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
                <MiniKPI label="Uptime" value={`${stats.avgUptime}%`} change={0.2} />
                <MiniKPI label="Active Servers" value={stats.total.toString()} change={2.1} />
                <MiniKPI label="Healthy" value={stats.healthy.toString()} change={5.3} />
                <MiniKPI label="Critical" value={stats.critical.toString()} change={stats.critical > 0 ? -10 : 0} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Alerts" activities={recentActivity} />

            <ProgressCard
              title="Capacity"
              value={stats.avgCpu}
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
                    <span className="text-xs font-semibold">{stats.healthy} ({stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${stats.total > 0 ? (stats.healthy / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Warning</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.warning} ({stats.total > 0 ? Math.round((stats.warning / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: `${stats.total > 0 ? (stats.warning / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Critical</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.critical} ({stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${stats.total > 0 ? (stats.critical / stats.total) * 100 : 0}%` }} />
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
