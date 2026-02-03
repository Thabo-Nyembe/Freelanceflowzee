'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Heart, Server, Database, Network, HardDrive, Cpu, CheckCircle, AlertTriangle } from 'lucide-react'

const systemMetrics = {
  cpu: { usage: 45, cores: 8, temperature: 62 },
  memory: { used: 12.5, total: 32, percentage: 39 },
  disk: { used: 450, total: 1000, percentage: 45 },
  network: { in: 125, out: 89, latency: 12 },
}

const services = [
  { name: 'Web Server', status: 'running', uptime: '15d 7h', cpu: 15, memory: 2.1 },
  { name: 'Database', status: 'running', uptime: '15d 7h', cpu: 25, memory: 4.5 },
  { name: 'Cache', status: 'running', uptime: '15d 7h', cpu: 8, memory: 1.8 },
  { name: 'Queue Worker', status: 'running', uptime: '2d 3h', cpu: 12, memory: 1.2 },
  { name: 'Backup Service', status: 'stopped', uptime: '0h', cpu: 0, memory: 0 },
]

const healthChecks = [
  { name: 'Database Connection', status: 'healthy', lastCheck: '30s ago' },
  { name: 'API Response Time', status: 'healthy', lastCheck: '1m ago' },
  { name: 'Disk Space', status: 'healthy', lastCheck: '5m ago' },
  { name: 'SSL Certificate', status: 'warning', lastCheck: '1h ago' },
  { name: 'Backup Status', status: 'error', lastCheck: '12h ago' },
]

export default function SystemHealthClient() {
  const stats = useMemo(() => ({
    servicesRunning: services.filter(s => s.status === 'running').length,
    healthyChecks: healthChecks.filter(h => h.status === 'healthy').length,
    cpuUsage: systemMetrics.cpu.usage,
    memoryUsage: systemMetrics.memory.percentage,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      running: 'bg-green-100 text-green-700',
      stopped: 'bg-red-100 text-red-700',
      restarting: 'bg-yellow-100 text-yellow-700',
      healthy: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Server, title: `${stats.servicesRunning}/${services.length}`, description: 'Services running' },
    { icon: CheckCircle, title: `${stats.healthyChecks}/${healthChecks.length}`, description: 'Health checks passing' },
    { icon: Cpu, title: `${stats.cpuUsage}%`, description: 'CPU usage' },
    { icon: HardDrive, title: `${stats.memoryUsage}%`, description: 'Memory usage' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="h-8 w-8 text-primary" />System Health</h1>
          <p className="text-muted-foreground mt-1">Monitor system resources and services</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Health Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{systemMetrics.cpu.usage}%</p>
            <Progress value={systemMetrics.cpu.usage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {systemMetrics.cpu.cores} cores • {systemMetrics.cpu.temperature}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{systemMetrics.memory.percentage}%</p>
            <Progress value={systemMetrics.memory.percentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {systemMetrics.memory.used}GB / {systemMetrics.memory.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Disk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{systemMetrics.disk.percentage}%</p>
            <Progress value={systemMetrics.disk.percentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {systemMetrics.disk.used}GB / {systemMetrics.disk.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{systemMetrics.network.latency}ms</p>
            <p className="text-xs text-muted-foreground">
              ↓ {systemMetrics.network.in}MB/s • ↑ {systemMetrics.network.out}MB/s
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Services</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {services.map((service) => (
                  <div key={service.name} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{service.name}</span>
                      {getStatusBadge(service.status)}
                    </div>
                    {service.status === 'running' && (
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <span>Uptime: {service.uptime}</span>
                        <span>CPU: {service.cpu}%</span>
                        <span>RAM: {service.memory}GB</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Health Checks</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {healthChecks.map((check) => (
                  <div key={check.name} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{check.name}</p>
                        <p className="text-xs text-muted-foreground">Last check: {check.lastCheck}</p>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
