'use client'

import { useState, useMemo } from 'react'
import {
  Activity,
  Zap,
  Clock,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  Bell,
  Eye,
  Plus,
  Settings,
  Calendar,
  ChevronRight,
  Terminal,
  Layers,
  Database,
  Gauge,
  Timer,
  Target,
  AlertCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePerformanceAnalytics, type PerformanceAnalytic } from '@/lib/hooks/use-performance-analytics'

// Types
interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'critical' | 'unknown'
  latency: number
  errorRate: number
  throughput: number
  uptime: number
  lastChecked: string
}

interface MetricData {
  id: string
  name: string
  category: 'infrastructure' | 'application' | 'business' | 'custom'
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  threshold: { warning: number; critical: number }
  status: 'normal' | 'warning' | 'critical'
}

interface Trace {
  id: string
  traceId: string
  service: string
  operation: string
  duration: number
  status: 'success' | 'error' | 'timeout'
  timestamp: string
  spans: number
  errorMessage?: string
}

interface Alert {
  id: string
  name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'firing' | 'resolved' | 'acknowledged'
  metric: string
  condition: string
  value: number
  threshold: number
  triggeredAt: string
  resolvedAt?: string
}

// Mock Data
const mockServices: ServiceHealth[] = [
  { name: 'API Gateway', status: 'healthy', latency: 45, errorRate: 0.02, throughput: 12500, uptime: 99.99, lastChecked: '2024-12-23T10:30:00Z' },
  { name: 'Auth Service', status: 'healthy', latency: 28, errorRate: 0.01, throughput: 8400, uptime: 99.98, lastChecked: '2024-12-23T10:30:00Z' },
  { name: 'User Service', status: 'degraded', latency: 156, errorRate: 1.2, throughput: 5200, uptime: 99.85, lastChecked: '2024-12-23T10:28:00Z' },
  { name: 'Payment Service', status: 'healthy', latency: 89, errorRate: 0.05, throughput: 3200, uptime: 99.95, lastChecked: '2024-12-23T10:30:00Z' },
  { name: 'Notification Service', status: 'healthy', latency: 35, errorRate: 0.08, throughput: 15600, uptime: 99.92, lastChecked: '2024-12-23T10:30:00Z' },
  { name: 'Analytics Service', status: 'critical', latency: 520, errorRate: 5.5, throughput: 1800, uptime: 98.50, lastChecked: '2024-12-23T10:25:00Z' },
]

const mockMetrics: MetricData[] = [
  { id: '1', name: 'Request Latency P99', category: 'application', value: 245, unit: 'ms', trend: 'up', change: 12, threshold: { warning: 200, critical: 500 }, status: 'warning' },
  { id: '2', name: 'Error Rate', category: 'application', value: 0.85, unit: '%', trend: 'down', change: -0.3, threshold: { warning: 1, critical: 5 }, status: 'normal' },
  { id: '3', name: 'CPU Utilization', category: 'infrastructure', value: 68, unit: '%', trend: 'up', change: 8, threshold: { warning: 70, critical: 90 }, status: 'normal' },
  { id: '4', name: 'Memory Usage', category: 'infrastructure', value: 72, unit: '%', trend: 'up', change: 5, threshold: { warning: 80, critical: 95 }, status: 'normal' },
  { id: '5', name: 'Disk I/O', category: 'infrastructure', value: 45, unit: 'MB/s', trend: 'stable', change: 0, threshold: { warning: 80, critical: 100 }, status: 'normal' },
  { id: '6', name: 'Network Throughput', category: 'infrastructure', value: 125, unit: 'Mbps', trend: 'up', change: 15, threshold: { warning: 200, critical: 300 }, status: 'normal' },
  { id: '7', name: 'Database Connections', category: 'application', value: 156, unit: '', trend: 'up', change: 24, threshold: { warning: 180, critical: 200 }, status: 'normal' },
  { id: '8', name: 'Cache Hit Rate', category: 'application', value: 94.5, unit: '%', trend: 'stable', change: 0.2, threshold: { warning: 90, critical: 80 }, status: 'normal' },
  { id: '9', name: 'Queue Depth', category: 'application', value: 45, unit: 'messages', trend: 'down', change: -12, threshold: { warning: 100, critical: 500 }, status: 'normal' },
  { id: '10', name: 'Active Users', category: 'business', value: 2847, unit: '', trend: 'up', change: 156, threshold: { warning: 0, critical: 0 }, status: 'normal' },
]

const mockTraces: Trace[] = [
  { id: '1', traceId: 'trace-abc123xyz', service: 'API Gateway', operation: 'POST /api/v2/users', duration: 245, status: 'success', timestamp: '2024-12-23T10:29:55Z', spans: 8 },
  { id: '2', traceId: 'trace-def456uvw', service: 'Auth Service', operation: 'POST /auth/login', duration: 128, status: 'success', timestamp: '2024-12-23T10:29:50Z', spans: 5 },
  { id: '3', traceId: 'trace-ghi789rst', service: 'Payment Service', operation: 'POST /payments/charge', duration: 892, status: 'error', timestamp: '2024-12-23T10:29:45Z', spans: 12, errorMessage: 'Payment gateway timeout' },
  { id: '4', traceId: 'trace-jkl012opq', service: 'User Service', operation: 'GET /api/v2/users/:id', duration: 156, status: 'success', timestamp: '2024-12-23T10:29:40Z', spans: 6 },
  { id: '5', traceId: 'trace-mno345lmn', service: 'Analytics Service', operation: 'POST /events/track', duration: 520, status: 'timeout', timestamp: '2024-12-23T10:29:35Z', spans: 3, errorMessage: 'Request timeout after 500ms' },
  { id: '6', traceId: 'trace-pqr678ijk', service: 'Notification Service', operation: 'POST /notifications/send', duration: 85, status: 'success', timestamp: '2024-12-23T10:29:30Z', spans: 4 },
]

const mockAlerts: Alert[] = [
  { id: '1', name: 'High Latency - Analytics Service', severity: 'critical', status: 'firing', metric: 'latency_p99', condition: '> 500ms', value: 520, threshold: 500, triggeredAt: '2024-12-23T10:25:00Z' },
  { id: '2', name: 'Error Rate Spike - User Service', severity: 'high', status: 'acknowledged', metric: 'error_rate', condition: '> 1%', value: 1.2, threshold: 1, triggeredAt: '2024-12-23T10:20:00Z' },
  { id: '3', name: 'Memory Usage Warning', severity: 'medium', status: 'resolved', metric: 'memory_usage', condition: '> 80%', value: 72, threshold: 80, triggeredAt: '2024-12-23T09:45:00Z', resolvedAt: '2024-12-23T10:00:00Z' },
  { id: '4', name: 'Database Connection Pool', severity: 'low', status: 'resolved', metric: 'db_connections', condition: '> 150', value: 156, threshold: 150, triggeredAt: '2024-12-23T08:30:00Z', resolvedAt: '2024-12-23T09:00:00Z' },
]

const statusColors: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  firing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  resolved: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  acknowledged: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  timeout: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

const severityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function PerformanceAnalyticsClient({ initialPerformanceAnalytics }: { initialPerformanceAnalytics: PerformanceAnalytic[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)
  const [showTraceDialog, setShowTraceDialog] = useState(false)

  const { performanceAnalytics } = usePerformanceAnalytics({})
  const displayMetrics = performanceAnalytics.length > 0 ? performanceAnalytics : initialPerformanceAnalytics

  // Calculate stats
  const healthyServices = mockServices.filter(s => s.status === 'healthy').length
  const avgLatency = mockServices.reduce((sum, s) => sum + s.latency, 0) / mockServices.length
  const overallErrorRate = mockServices.reduce((sum, s) => sum + s.errorRate, 0) / mockServices.length
  const firingAlerts = mockAlerts.filter(a => a.status === 'firing').length

  const filteredMetrics = useMemo(() => {
    return mockMetrics.filter(m => {
      const matchesSearch = searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Performance Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Datadog-level APM, metrics, and observability
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Clock className="w-4 h-4 text-gray-500" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none dark:text-white"
              >
                <option value="15m">Last 15 min</option>
                <option value="1h">Last 1 hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowAlertDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Bell className="w-4 h-4" />
              Alerts ({firingAlerts})
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2">
          {['APM Traces', 'Infrastructure Metrics', 'Service Health', 'Alerting', 'Dashboards', 'Log Analysis'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Service Health</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{healthyServices}/{mockServices.length}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {((healthyServices / mockServices.length) * 100).toFixed(0)}% healthy
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Latency P99</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{avgLatency.toFixed(0)}ms</p>
                <div className="flex items-center gap-1 mt-2 text-yellow-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12% vs last hour</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Timer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{overallErrorRate.toFixed(2)}%</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">-0.3% vs last hour</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className={`text-3xl font-bold mt-1 ${firingAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>{firingAlerts}</p>
                <div className="flex items-center gap-1 mt-2 text-gray-500">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm font-medium">{mockAlerts.filter(a => a.status === 'acknowledged').length} acknowledged</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${firingAlerts > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <Bell className={`w-6 h-6 ${firingAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2">
              <Server className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2">
              <Gauge className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="traces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2">
              <Layers className="w-4 h-4 mr-2" />
              Traces
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-4 py-2">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Health Map */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Health Map</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {mockServices.map((service) => (
                    <div
                      key={service.name}
                      className={`p-4 rounded-lg border-2 ${
                        service.status === 'healthy' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                        service.status === 'degraded' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                        <span className={`w-3 h-3 rounded-full ${
                          service.status === 'healthy' ? 'bg-green-500' :
                          service.status === 'degraded' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span className="font-medium">{service.latency}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span className="font-medium">{service.errorRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Traces */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Traces</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockTraces.slice(0, 5).map((trace) => (
                      <div
                        key={trace.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => { setSelectedTrace(trace); setShowTraceDialog(true); }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{trace.operation}</p>
                            <p className="text-xs text-gray-500">{trace.service} • {trace.spans} spans</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[trace.status]}`}>
                              {formatDuration(trace.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Active Alerts Banner */}
            {firingAlerts > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      {firingAlerts} active alert{firingAlerts > 1 ? 's' : ''} require attention
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {mockAlerts.filter(a => a.status === 'firing').map(a => a.name).join(', ')}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                    View Alerts
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Health Dashboard</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency P99</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Throughput</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockServices.map((service) => (
                      <tr key={service.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Server className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[service.status]}`}>
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${service.latency > 200 ? 'text-yellow-600' : service.latency > 500 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {service.latency}ms
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${service.errorRate > 1 ? 'text-yellow-600' : service.errorRate > 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {service.errorRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{service.throughput.toLocaleString()}/min</td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${service.uptime < 99.9 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {service.uptime}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(service.lastChecked)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Metrics</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search metrics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="application">Application</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredMetrics.map((metric) => (
                  <div key={metric.id} className={`p-4 rounded-xl border-2 ${
                    metric.status === 'normal' ? 'border-gray-200 dark:border-gray-700' :
                    metric.status === 'warning' ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20' :
                    'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{metric.category}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[metric.status]}`}>
                        {metric.status}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{metric.name}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                        <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {metric.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                        {metric.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                        {metric.change !== 0 && <span>{metric.change > 0 ? '+' : ''}{metric.change}{metric.unit === '%' ? 'pp' : ''}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Traces Tab */}
          <TabsContent value="traces" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distributed Traces</h3>
                  <p className="text-sm text-gray-500">{mockTraces.length} traces in the last hour</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trace ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spans</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockTraces.map((trace) => (
                      <tr
                        key={trace.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => { setSelectedTrace(trace); setShowTraceDialog(true); }}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-blue-600">{trace.traceId}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{trace.service}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">{trace.operation}</td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${trace.duration > 200 ? 'text-yellow-600' : trace.duration > 500 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {formatDuration(trace.duration)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[trace.status]}`}>
                            {trace.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{trace.spans}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(trace.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alert History</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4" />
                    Create Alert
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triggered</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{alert.name}</p>
                          <p className="text-xs text-gray-500">{alert.metric}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[alert.severity]}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[alert.status]}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">{alert.condition}</td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${alert.value > alert.threshold ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {alert.value}
                          </span>
                          <span className="text-gray-500"> / {alert.threshold}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(alert.triggeredAt)}</td>
                        <td className="px-6 py-4 text-right">
                          {alert.status === 'firing' && (
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Trace Detail Dialog */}
        <Dialog open={showTraceDialog} onOpenChange={setShowTraceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Trace Details</DialogTitle>
              <DialogDescription>{selectedTrace?.traceId}</DialogDescription>
            </DialogHeader>
            {selectedTrace && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Service</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTrace.service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Operation</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{selectedTrace.operation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDuration(selectedTrace.duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[selectedTrace.status]}`}>
                      {selectedTrace.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Spans</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedTrace.spans}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Timestamp</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedTrace.timestamp)}</p>
                  </div>
                </div>
                {selectedTrace.errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs text-red-600 uppercase mb-1">Error Message</p>
                    <p className="text-sm text-red-800 dark:text-red-200">{selectedTrace.errorMessage}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <button onClick={() => setShowTraceDialog(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
