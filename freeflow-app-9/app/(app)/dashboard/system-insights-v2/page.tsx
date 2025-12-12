"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

/**
 * System Insights V2 - Groundbreaking System Monitoring
 * Showcases system health and performance monitoring with modern components
 */
export default function SystemInsightsV2() {
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'logs'>('overview')

  const stats = [
    { label: 'System Uptime', value: '99.9%', change: 0.2, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Active Services', value: '47', change: 0, icon: <Activity className="w-5 h-5" /> },
    { label: 'Avg Response Time', value: '124ms', change: -12.5, icon: <Zap className="w-5 h-5" /> },
    { label: 'Error Rate', value: '0.02%', change: -25.3, icon: <AlertTriangle className="w-5 h-5" /> }
  ]

  const systemResources = [
    {
      name: 'CPU Usage',
      value: 42,
      unit: '%',
      status: 'healthy',
      icon: <Cpu className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Memory',
      value: 67,
      unit: '%',
      status: 'warning',
      icon: <Server className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Disk Usage',
      value: 34,
      unit: '%',
      status: 'healthy',
      icon: <HardDrive className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Network',
      value: 89,
      unit: 'Mbps',
      status: 'healthy',
      icon: <Network className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const services = [
    {
      id: '1',
      name: 'API Gateway',
      status: 'running',
      uptime: '99.9%',
      requests: '2.4M',
      latency: '124ms',
      lastCheck: '1 min ago'
    },
    {
      id: '2',
      name: 'Database Primary',
      status: 'running',
      uptime: '99.8%',
      requests: '5.2M',
      latency: '45ms',
      lastCheck: '1 min ago'
    },
    {
      id: '3',
      name: 'Cache Server',
      status: 'running',
      uptime: '100%',
      requests: '8.7M',
      latency: '12ms',
      lastCheck: '1 min ago'
    },
    {
      id: '4',
      name: 'Background Jobs',
      status: 'warning',
      uptime: '98.5%',
      requests: '847K',
      latency: '234ms',
      lastCheck: '5 min ago'
    }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Health check passed', description: 'All systems operational', time: '1 minute ago', status: 'success' as const },
    { icon: <AlertTriangle className="w-5 h-5" />, title: 'High memory usage', description: 'Warning threshold reached', time: '5 minutes ago', status: 'warning' as const },
    { icon: <RefreshCw className="w-5 h-5" />, title: 'Service restarted', description: 'Background Jobs service', time: '15 minutes ago', status: 'info' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Deployment completed', description: 'Version 2.4.1 deployed', time: '1 hour ago', status: 'success' as const }
  ]

  const performanceMetrics = [
    { label: 'Requests/sec', value: '2,847', change: 25.3 },
    { label: 'Peak CPU', value: '78%', change: 12.5 },
    { label: 'Cache Hit Rate', value: '94%', change: 5.2 },
    { label: 'DB Queries/sec', value: '1,245', change: 18.7 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'stopped': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-3 h-3" />
      case 'warning': return <AlertTriangle className="w-3 h-3" />
      case 'error': return <AlertTriangle className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const getResourceColor = (value: number) => {
    if (value >= 80) return 'text-red-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10 text-slate-600" />
              System Insights
            </h1>
            <p className="text-muted-foreground">Monitor system health and performance</p>
          </div>
          <GradientButton from="slate" to="gray" onClick={() => console.log('Settings')}>
            <Settings className="w-5 h-5 mr-2" />
            Configure Alerts
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Server />} title="Services" description="Status" onClick={() => console.log('Services')} />
          <BentoQuickAction icon={<Database />} title="Database" description="Health" onClick={() => console.log('Database')} />
          <BentoQuickAction icon={<Activity />} title="Metrics" description="Real-time" onClick={() => console.log('Metrics')} />
          <BentoQuickAction icon={<AlertTriangle />} title="Alerts" description="Incidents" onClick={() => console.log('Alerts')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedView === 'overview' ? 'primary' : 'ghost'} onClick={() => setSelectedView('overview')}>
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </PillButton>
          <PillButton variant={selectedView === 'performance' ? 'primary' : 'ghost'} onClick={() => setSelectedView('performance')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </PillButton>
          <PillButton variant={selectedView === 'logs' ? 'primary' : 'ghost'} onClick={() => setSelectedView('logs')}>
            <Clock className="w-4 h-4 mr-2" />
            Logs
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">System Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemResources.map((resource) => (
              <div key={resource.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${resource.color} flex items-center justify-center text-white`}>
                      {resource.icon}
                    </div>
                    <span className="font-medium">{resource.name}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getResourceColor(resource.value)}`}>
                      {resource.value}{resource.unit}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      resource.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${resource.color} transition-all duration-300`}
                      style={{ width: `${resource.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Services Status</h3>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(service.status)}`}>
                            {getStatusIcon(service.status)}
                            {service.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                          <div>
                            <p className="text-muted-foreground">Uptime</p>
                            <p className="font-semibold text-foreground">{service.uptime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Requests</p>
                            <p className="font-semibold text-foreground">{service.requests}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Latency</p>
                            <p className="font-semibold text-foreground">{service.latency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Check</p>
                            <p className="font-semibold text-foreground">{service.lastCheck}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', service.id)}>
                          <Activity className="w-3 h-3 mr-1" />
                          Details
                        </ModernButton>
                        {service.status === 'warning' && (
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Restart', service.id)}>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Restart
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                {performanceMetrics.map((metric) => (
                  <MiniKPI key={metric.label} label={metric.label} value={metric.value} change={metric.change} />
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
