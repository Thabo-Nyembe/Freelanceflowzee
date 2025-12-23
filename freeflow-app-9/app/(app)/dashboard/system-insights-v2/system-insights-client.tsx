'use client'
import { useState, useMemo } from 'react'
import { useSystemInsights, type SystemInsight, type InsightType, type InsightSeverity, type InsightStatus } from '@/lib/hooks/use-system-insights'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Grafana / Prometheus / Kibana level interfaces
interface Dashboard {
  id: string
  name: string
  description: string
  panels: Panel[]
  variables: Variable[]
  timeRange: { from: string; to: string }
  refreshInterval: number
  starred: boolean
  createdAt: string
  updatedAt: string
}

interface Panel {
  id: string
  title: string
  type: 'graph' | 'stat' | 'gauge' | 'table' | 'heatmap' | 'logs' | 'alert'
  query: string
  visualization: string
  thresholds: { value: number; color: string }[]
  position: { x: number; y: number; w: number; h: number }
}

interface Variable {
  name: string
  type: 'query' | 'custom' | 'interval'
  current: string
  options: string[]
}

interface Metric {
  id: string
  name: string
  value: number
  unit: string
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  sparkline: number[]
  thresholds: { warning: number; critical: number }
  status: 'normal' | 'warning' | 'critical'
}

interface Alert {
  id: string
  name: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  status: 'firing' | 'pending' | 'resolved'
  message: string
  metric: string
  value: number
  threshold: number
  startedAt: string
  resolvedAt?: string
  annotations: { key: string; value: string }[]
  labels: { key: string; value: string }[]
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  service: string
  message: string
  metadata: Record<string, string>
  traceId?: string
}

interface ServiceHealth {
  id: string
  name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  latency: number
  errorRate: number
  requestsPerSecond: number
  lastChecked: string
  dependencies: { name: string; status: 'healthy' | 'degraded' | 'down' }[]
}

// Mock data for Grafana level features
const mockMetrics: Metric[] = [
  { id: 'm1', name: 'CPU Usage', value: 67.5, unit: '%', change: 5.2, changePercent: 8.3, trend: 'up', sparkline: [55, 58, 62, 65, 68, 70, 65, 67.5], thresholds: { warning: 75, critical: 90 }, status: 'normal' },
  { id: 'm2', name: 'Memory Usage', value: 82.3, unit: '%', change: 3.1, changePercent: 3.9, trend: 'up', sparkline: [75, 76, 78, 80, 79, 81, 83, 82.3], thresholds: { warning: 80, critical: 95 }, status: 'warning' },
  { id: 'm3', name: 'Disk I/O', value: 245, unit: 'MB/s', change: -12, changePercent: -4.7, trend: 'down', sparkline: [280, 265, 258, 250, 248, 252, 240, 245], thresholds: { warning: 400, critical: 500 }, status: 'normal' },
  { id: 'm4', name: 'Network In', value: 1.24, unit: 'GB/s', change: 0.08, changePercent: 6.9, trend: 'up', sparkline: [1.1, 1.15, 1.18, 1.2, 1.22, 1.21, 1.23, 1.24], thresholds: { warning: 2, critical: 3 }, status: 'normal' },
  { id: 'm5', name: 'Network Out', value: 0.89, unit: 'GB/s', change: 0.05, changePercent: 5.9, trend: 'up', sparkline: [0.8, 0.82, 0.84, 0.86, 0.85, 0.87, 0.88, 0.89], thresholds: { warning: 2, critical: 3 }, status: 'normal' },
  { id: 'm6', name: 'Active Connections', value: 12450, unit: '', change: 890, changePercent: 7.7, trend: 'up', sparkline: [10500, 11000, 11400, 11800, 12100, 12300, 12400, 12450], thresholds: { warning: 15000, critical: 20000 }, status: 'normal' },
  { id: 'm7', name: 'Request Latency', value: 145, unit: 'ms', change: 12, changePercent: 9.0, trend: 'up', sparkline: [120, 125, 130, 135, 140, 138, 142, 145], thresholds: { warning: 200, critical: 500 }, status: 'normal' },
  { id: 'm8', name: 'Error Rate', value: 0.8, unit: '%', change: 0.3, changePercent: 60, trend: 'up', sparkline: [0.4, 0.5, 0.5, 0.6, 0.7, 0.65, 0.75, 0.8], thresholds: { warning: 1, critical: 5 }, status: 'normal' }
]

const mockAlerts: Alert[] = [
  { id: 'a1', name: 'High Memory Usage', severity: 'warning', status: 'firing', message: 'Memory usage exceeded 80% threshold', metric: 'memory_usage_percent', value: 82.3, threshold: 80, startedAt: '2024-12-20T14:30:00Z', annotations: [{ key: 'summary', value: 'Memory usage is high' }, { key: 'description', value: 'Consider scaling up or optimizing memory usage' }], labels: [{ key: 'service', value: 'api-gateway' }, { key: 'env', value: 'production' }] },
  { id: 'a2', name: 'API Latency Spike', severity: 'warning', status: 'firing', message: 'API response time increased significantly', metric: 'http_request_duration_seconds', value: 145, threshold: 120, startedAt: '2024-12-20T15:15:00Z', annotations: [{ key: 'summary', value: 'API is slow' }], labels: [{ key: 'service', value: 'api-gateway' }] },
  { id: 'a3', name: 'Database Connection Pool', severity: 'info', status: 'pending', message: 'Connection pool usage above 60%', metric: 'db_connection_pool_usage', value: 65, threshold: 60, startedAt: '2024-12-20T15:45:00Z', annotations: [], labels: [{ key: 'database', value: 'primary' }] },
  { id: 'a4', name: 'Disk Space Low', severity: 'critical', status: 'resolved', message: 'Disk space was critically low', metric: 'disk_usage_percent', value: 95, threshold: 90, startedAt: '2024-12-20T10:00:00Z', resolvedAt: '2024-12-20T11:30:00Z', annotations: [{ key: 'summary', value: 'Disk cleanup completed' }], labels: [{ key: 'mount', value: '/data' }] },
  { id: 'a5', name: 'SSL Certificate Expiry', severity: 'warning', status: 'firing', message: 'SSL certificate expires in 7 days', metric: 'ssl_cert_expiry_days', value: 7, threshold: 14, startedAt: '2024-12-20T00:00:00Z', annotations: [{ key: 'domain', value: 'api.example.com' }], labels: [] }
]

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2024-12-20T15:59:45Z', level: 'error', service: 'api-gateway', message: 'Connection timeout to database after 30s', metadata: { requestId: 'req-abc123', userId: 'user-456' }, traceId: 'trace-789' },
  { id: 'l2', timestamp: '2024-12-20T15:59:30Z', level: 'warn', service: 'auth-service', message: 'Failed login attempt from suspicious IP', metadata: { ip: '192.168.1.100', attempts: '5' } },
  { id: 'l3', timestamp: '2024-12-20T15:59:15Z', level: 'info', service: 'user-service', message: 'User profile updated successfully', metadata: { userId: 'user-123' } },
  { id: 'l4', timestamp: '2024-12-20T15:59:00Z', level: 'error', service: 'payment-service', message: 'Payment processing failed: insufficient funds', metadata: { orderId: 'ord-xyz', amount: '150.00' } },
  { id: 'l5', timestamp: '2024-12-20T15:58:45Z', level: 'info', service: 'notification-service', message: 'Email sent successfully', metadata: { to: 'user@example.com', template: 'welcome' } },
  { id: 'l6', timestamp: '2024-12-20T15:58:30Z', level: 'debug', service: 'cache-service', message: 'Cache hit for key user:123:profile', metadata: { ttl: '3600' } },
  { id: 'l7', timestamp: '2024-12-20T15:58:15Z', level: 'warn', service: 'api-gateway', message: 'Rate limit approaching for client', metadata: { clientId: 'client-abc', remaining: '10' } },
  { id: 'l8', timestamp: '2024-12-20T15:58:00Z', level: 'fatal', service: 'worker-service', message: 'Worker process crashed unexpectedly', metadata: { pid: '12345', signal: 'SIGSEGV' } }
]

const mockServices: ServiceHealth[] = [
  { id: 's1', name: 'API Gateway', status: 'healthy', uptime: 99.98, latency: 45, errorRate: 0.02, requestsPerSecond: 2500, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Auth Service', status: 'healthy' }, { name: 'Cache', status: 'healthy' }] },
  { id: 's2', name: 'Auth Service', status: 'healthy', uptime: 99.99, latency: 12, errorRate: 0.01, requestsPerSecond: 1200, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Database', status: 'healthy' }] },
  { id: 's3', name: 'User Service', status: 'degraded', uptime: 99.5, latency: 156, errorRate: 0.8, requestsPerSecond: 850, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Database', status: 'healthy' }, { name: 'Cache', status: 'degraded' }] },
  { id: 's4', name: 'Payment Service', status: 'healthy', uptime: 99.95, latency: 230, errorRate: 0.15, requestsPerSecond: 320, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Stripe API', status: 'healthy' }] },
  { id: 's5', name: 'Notification Service', status: 'healthy', uptime: 99.9, latency: 89, errorRate: 0.05, requestsPerSecond: 450, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Email Provider', status: 'healthy' }, { name: 'SMS Provider', status: 'healthy' }] },
  { id: 's6', name: 'Worker Service', status: 'down', uptime: 98.5, latency: 0, errorRate: 100, requestsPerSecond: 0, lastChecked: '2024-12-20T15:58:00Z', dependencies: [{ name: 'Queue', status: 'healthy' }] }
]

export default function SystemInsightsClient({ initialInsights }: { initialInsights: SystemInsight[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [typeFilter, setTypeFilter] = useState<InsightType | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<InsightSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<InsightStatus | 'all'>('all')
  const [timeRange, setTimeRange] = useState('1h')
  const [logLevel, setLogLevel] = useState<string>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const { insights, loading, error } = useSystemInsights({ insightType: typeFilter, severity: severityFilter, status: statusFilter })
  const displayInsights = insights.length > 0 ? insights : initialInsights

  // Calculate stats
  const stats = useMemo(() => {
    const firing = mockAlerts.filter(a => a.status === 'firing').length
    const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'firing').length
    const healthyServices = mockServices.filter(s => s.status === 'healthy').length
    const avgUptime = mockServices.reduce((sum, s) => sum + s.uptime, 0) / mockServices.length
    const totalRps = mockServices.reduce((sum, s) => sum + s.requestsPerSecond, 0)

    return {
      firingAlerts: firing,
      criticalAlerts,
      healthyServices,
      totalServices: mockServices.length,
      avgUptime: avgUptime.toFixed(2),
      totalRps,
      errorLogs: mockLogs.filter(l => l.level === 'error' || l.level === 'fatal').length,
      warningMetrics: mockMetrics.filter(m => m.status === 'warning').length
    }
  }, [])

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'text-gray-500 dark:text-gray-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      case 'warn': return 'text-amber-600 dark:text-amber-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'fatal': return 'text-red-800 dark:text-red-300 font-bold'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
      case 'degraded': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      case 'down': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      case 'error': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">Grafana Level</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">Prometheus Style</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">System Insights</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time infrastructure monitoring, logs & alerting</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
            <button className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors">
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Firing Alerts</div>
            <div className={`text-2xl font-bold ${stats.firingAlerts > 0 ? 'text-amber-600' : 'text-green-600'}`}>{stats.firingAlerts}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Critical</div>
            <div className={`text-2xl font-bold ${stats.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.criticalAlerts}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Services</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.healthyServices}/{stats.totalServices}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Uptime</div>
            <div className="text-2xl font-bold text-green-600">{stats.avgUptime}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total RPS</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalRps.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPU</div>
            <div className="text-2xl font-bold text-purple-600">{mockMetrics[0].value}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Memory</div>
            <div className={`text-2xl font-bold ${mockMetrics[1].status === 'warning' ? 'text-amber-600' : 'text-purple-600'}`}>{mockMetrics[1].value}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error Logs</div>
            <div className={`text-2xl font-bold ${stats.errorLogs > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.errorLogs}</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-300">Overview</TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-300">Metrics</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-300">Alerts</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-300">Logs</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-300">Services</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Health Map */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Health</h3>
                <div className="grid grid-cols-3 gap-3">
                  {mockServices.map(service => (
                    <div key={service.id} className={`p-3 rounded-lg border ${
                      service.status === 'healthy' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                      service.status === 'degraded' ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' :
                      'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          service.status === 'healthy' ? 'bg-green-500' :
                          service.status === 'degraded' ? 'bg-amber-500' :
                          'bg-red-500'
                        } animate-pulse`} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{service.latency}ms • {service.uptime}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Alerts</h3>
                <div className="space-y-3">
                  {mockAlerts.filter(a => a.status === 'firing').map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                      alert.severity === 'error' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' :
                      'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{alert.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                    </div>
                  ))}
                  {mockAlerts.filter(a => a.status === 'firing').length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No active alerts</div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockMetrics.slice(0, 4).map(metric => (
                  <div key={metric.id} className={`p-4 rounded-lg ${
                    metric.status === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                    metric.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' :
                    'bg-gray-50 dark:bg-gray-700/50'
                  }`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.name}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}{metric.unit}</div>
                    <div className={`text-sm mt-1 ${metric.trend === 'up' ? 'text-red-600' : metric.trend === 'down' ? 'text-green-600' : 'text-gray-500'}`}>
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.changePercent)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Logs</h3>
              <div className="space-y-2 font-mono text-sm">
                {mockLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`px-2 py-0.5 rounded text-xs uppercase ${getLogLevelColor(log.level)} bg-gray-100 dark:bg-gray-700`}>{log.level}</span>
                    <span className="text-blue-600 dark:text-blue-400">[{log.service}]</span>
                    <span className="text-gray-700 dark:text-gray-300 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockMetrics.map(metric => (
                <div key={metric.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${
                  metric.status === 'critical' ? 'border-red-300 dark:border-red-800' :
                  metric.status === 'warning' ? 'border-amber-300 dark:border-amber-800' :
                  'border-gray-100 dark:border-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      metric.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                      metric.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    }`}>{metric.status}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {metric.value}<span className="text-lg text-gray-500 dark:text-gray-400">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-red-600' : metric.trend === 'down' ? 'text-green-600' : 'text-gray-500'}`}>
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({metric.changePercent}%)</span>
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {metric.sparkline.map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t ${
                          val >= metric.thresholds.critical ? 'bg-red-500' :
                          val >= metric.thresholds.warning ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}
                        style={{ height: `${(val / Math.max(...metric.sparkline)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Warning: {metric.thresholds.warning}{metric.unit} • Critical: {metric.thresholds.critical}{metric.unit}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex gap-3 mb-4">
              <select
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                defaultValue="all"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                defaultValue="all"
              >
                <option value="all">All Status</option>
                <option value="firing">Firing</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {mockAlerts.map(alert => (
              <Dialog key={alert.id}>
                <DialogTrigger asChild>
                  <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border cursor-pointer hover:shadow-md transition-all ${
                    alert.status === 'firing' ? (
                      alert.severity === 'critical' ? 'border-red-300 dark:border-red-800' :
                      alert.severity === 'error' ? 'border-orange-300 dark:border-orange-800' :
                      'border-amber-300 dark:border-amber-800'
                    ) : 'border-gray-100 dark:border-gray-700'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            alert.status === 'firing' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                            alert.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          }`}>{alert.status}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{alert.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(alert.startedAt).toLocaleString()}</div>
                        <div className="text-sm font-mono mt-1">{alert.value} / {alert.threshold}</div>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{alert.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Value</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{alert.value}</div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Threshold</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{alert.threshold}</div>
                      </div>
                    </div>
                    {alert.annotations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Annotations</h4>
                        <div className="space-y-2">
                          {alert.annotations.map((ann, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{ann.key}:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{ann.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {alert.labels.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Labels</h4>
                        <div className="flex flex-wrap gap-2">
                          {alert.labels.map((label, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                              {label.key}={label.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="Search logs..."
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="fatal">Fatal</option>
              </select>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1">
                  {mockLogs.filter(log => logLevel === 'all' || log.level === logLevel).map(log => (
                    <div key={log.id} className="flex items-start gap-3 hover:bg-gray-800 p-2 rounded">
                      <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                        log.level === 'debug' ? 'bg-gray-700 text-gray-400' :
                        log.level === 'info' ? 'bg-blue-900 text-blue-300' :
                        log.level === 'warn' ? 'bg-amber-900 text-amber-300' :
                        log.level === 'error' ? 'bg-red-900 text-red-300' :
                        'bg-red-800 text-red-200'
                      }`}>{log.level}</span>
                      <span className="text-cyan-400">[{log.service}]</span>
                      <span className="text-gray-300 flex-1">{log.message}</span>
                      {log.traceId && (
                        <span className="text-purple-400 text-xs">{log.traceId}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {mockServices.map(service => (
              <div key={service.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${
                service.status === 'healthy' ? 'border-green-200 dark:border-green-800' :
                service.status === 'degraded' ? 'border-amber-200 dark:border-amber-800' :
                'border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' :
                        service.status === 'degraded' ? 'bg-amber-500' :
                        'bg-red-500'
                      } animate-pulse`} />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(service.status)}`}>{service.status}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span>Latency: {service.latency}ms</span>
                      <span>Uptime: {service.uptime}%</span>
                      <span>Error Rate: {service.errorRate}%</span>
                      <span>RPS: {service.requestsPerSecond.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
                {service.dependencies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dependencies:</span>
                    <div className="flex gap-2 mt-2">
                      {service.dependencies.map(dep => (
                        <span key={dep.name} className={`px-2 py-1 rounded text-xs ${getStatusColor(dep.status)}`}>
                          {dep.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent" />
          </div>
        )}
      </div>
    </div>
  )
}
