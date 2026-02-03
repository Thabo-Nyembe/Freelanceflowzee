'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Activity, TrendingUp, TrendingDown, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

const metrics = [
  { name: 'Response Time', value: '245ms', change: -12, target: 300, status: 'good' },
  { name: 'Error Rate', value: '0.3%', change: -0.1, target: 1, status: 'good' },
  { name: 'CPU Usage', value: '45%', change: 5, target: 80, status: 'good' },
  { name: 'Memory Usage', value: '67%', change: 3, target: 80, status: 'warning' },
  { name: 'Throughput', value: '1.2k/s', change: 15, target: 1000, status: 'good' },
  { name: 'Uptime', value: '99.9%', change: 0.1, target: 99.5, status: 'excellent' },
]

const services = [
  { name: 'API Gateway', status: 'healthy', uptime: 99.99, responseTime: 120, requests: 15000 },
  { name: 'Database', status: 'healthy', uptime: 99.95, responseTime: 45, requests: 25000 },
  { name: 'Cache Server', status: 'healthy', uptime: 99.98, responseTime: 5, requests: 50000 },
  { name: 'Auth Service', status: 'degraded', uptime: 98.5, responseTime: 350, requests: 8000 },
]

const alerts = [
  { id: 1, severity: 'warning', message: 'Memory usage approaching threshold', service: 'API Gateway', time: '5 min ago' },
  { id: 2, severity: 'info', message: 'Deployment completed successfully', service: 'Web App', time: '1 hour ago' },
  { id: 3, severity: 'critical', message: 'Response time spike detected', service: 'Auth Service', time: '2 hours ago' },
]

export default function PerformanceMonitoringClient() {
  const stats = useMemo(() => ({
    healthy: services.filter(s => s.status === 'healthy').length,
    avgUptime: (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2),
    totalRequests: services.reduce((sum, s) => sum + s.requests, 0),
    activeAlerts: alerts.filter(a => a.severity !== 'info').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      healthy: 'bg-green-100 text-green-700',
      degraded: 'bg-yellow-100 text-yellow-700',
      down: 'bg-red-100 text-red-700',
      excellent: 'bg-blue-100 text-blue-700',
      good: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      warning: 'bg-yellow-100 text-yellow-700',
      info: 'bg-blue-100 text-blue-700',
    }
    return <Badge className={styles[severity]}>{severity}</Badge>
  }

  const insights = [
    { icon: Activity, title: `${stats.healthy}/${services.length}`, description: 'Services healthy' },
    { icon: TrendingUp, title: `${stats.avgUptime}%`, description: 'Avg uptime' },
    { icon: Zap, title: `${stats.totalRequests.toLocaleString()}`, description: 'Total requests' },
    { icon: AlertTriangle, title: `${stats.activeAlerts}`, description: 'Active alerts' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Activity className="h-8 w-8 text-primary" />Performance Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time system performance metrics</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="System Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{metric.name}</h4>
                    {getStatusBadge(metric.status)}
                  </div>
                  <p className="text-3xl font-bold mb-2">{metric.value}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                    <span className={metric.change > 0 ? 'text-red-600' : 'text-green-600'}>
                      {Math.abs(metric.change)}{metric.name.includes('Rate') || metric.name.includes('Uptime') ? '%' : metric.name.includes('Time') ? 'ms' : '%'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card key={service.name} className={service.status === 'degraded' ? 'border-yellow-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{service.name}</h4>
                    {getStatusBadge(service.status)}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{service.uptime}%</span>
                      </div>
                      <Progress value={service.uptime} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="font-medium">{service.responseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Requests</p>
                        <p className="font-medium">{service.requests.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(alert.severity)}
                          <span className="font-medium">{alert.service}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{alert.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
