'use client'
import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Activity, AlertTriangle, Server, Database, Cpu, HardDrive, Network,
  Clock, TrendingUp, TrendingDown, RefreshCw, Settings, Search, Filter,
  Bell, Eye, Terminal, Layers, Zap, GitBranch, Box, Workflow, Globe,
  FileText, BarChart3, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle,
  AlertCircle, Play, Pause, ChevronRight, MoreVertical, Download, Share2,
  Plus, Trash2, Edit3, Copy, ExternalLink, Link, Mail, Webhook, Shield
} from 'lucide-react'

// Type definitions
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
  host?: string
}

interface Alert {
  id: string
  name: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  status: 'firing' | 'pending' | 'resolved' | 'muted'
  message: string
  metric: string
  value: number
  threshold: number
  startedAt: string
  resolvedAt?: string
  tags: Record<string, string>
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  service: string
  host: string
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
  apdex: number
  lastChecked: string
  dependencies: { name: string; status: 'healthy' | 'degraded' | 'down' }[]
}

interface Trace {
  id: string
  traceId: string
  name: string
  service: string
  duration: number
  status: 'ok' | 'error'
  timestamp: string
  spans: Span[]
  resource: string
}

interface Span {
  id: string
  name: string
  service: string
  duration: number
  startTime: number
  status: 'ok' | 'error'
  resource: string
  tags: Record<string, string>
}

interface Host {
  id: string
  name: string
  status: 'running' | 'warning' | 'critical' | 'offline'
  cpu: number
  memory: number
  disk: number
  network: { in: number; out: number }
  apps: number
  os: string
  uptime: string
}

interface APMService {
  id: string
  name: string
  language: string
  requestCount: number
  errorRate: number
  avgLatency: number
  p99Latency: number
  apdex: number
  status: 'healthy' | 'degraded' | 'critical'
}

// Mock data
const mockMetrics: Metric[] = [
  { id: 'm1', name: 'CPU Usage', value: 67.5, unit: '%', change: 5.2, changePercent: 8.3, trend: 'up', sparkline: [55, 58, 62, 65, 68, 70, 65, 67.5], thresholds: { warning: 75, critical: 90 }, status: 'normal', host: 'web-01' },
  { id: 'm2', name: 'Memory Usage', value: 82.3, unit: '%', change: 3.1, changePercent: 3.9, trend: 'up', sparkline: [75, 76, 78, 80, 79, 81, 83, 82.3], thresholds: { warning: 80, critical: 95 }, status: 'warning', host: 'web-01' },
  { id: 'm3', name: 'Disk I/O', value: 245, unit: 'MB/s', change: -12, changePercent: -4.7, trend: 'down', sparkline: [280, 265, 258, 250, 248, 252, 240, 245], thresholds: { warning: 400, critical: 500 }, status: 'normal', host: 'db-01' },
  { id: 'm4', name: 'Network In', value: 1.24, unit: 'GB/s', change: 0.08, changePercent: 6.9, trend: 'up', sparkline: [1.1, 1.15, 1.18, 1.2, 1.22, 1.21, 1.23, 1.24], thresholds: { warning: 2, critical: 3 }, status: 'normal' },
  { id: 'm5', name: 'Network Out', value: 0.89, unit: 'GB/s', change: 0.05, changePercent: 5.9, trend: 'up', sparkline: [0.8, 0.82, 0.84, 0.86, 0.85, 0.87, 0.88, 0.89], thresholds: { warning: 2, critical: 3 }, status: 'normal' },
  { id: 'm6', name: 'Active Connections', value: 12450, unit: '', change: 890, changePercent: 7.7, trend: 'up', sparkline: [10500, 11000, 11400, 11800, 12100, 12300, 12400, 12450], thresholds: { warning: 15000, critical: 20000 }, status: 'normal' },
  { id: 'm7', name: 'Request Latency', value: 145, unit: 'ms', change: 12, changePercent: 9.0, trend: 'up', sparkline: [120, 125, 130, 135, 140, 138, 142, 145], thresholds: { warning: 200, critical: 500 }, status: 'normal' },
  { id: 'm8', name: 'Error Rate', value: 0.8, unit: '%', change: 0.3, changePercent: 60, trend: 'up', sparkline: [0.4, 0.5, 0.5, 0.6, 0.7, 0.65, 0.75, 0.8], thresholds: { warning: 1, critical: 5 }, status: 'normal' }
]

const mockAlerts: Alert[] = [
  { id: 'a1', name: 'High Memory Usage', severity: 'warning', status: 'firing', message: 'Memory usage exceeded 80% threshold on web-01', metric: 'system.memory.usage', value: 82.3, threshold: 80, startedAt: '2024-12-20T14:30:00Z', tags: { service: 'api-gateway', env: 'production', host: 'web-01' } },
  { id: 'a2', name: 'API Latency Spike', severity: 'warning', status: 'firing', message: 'P99 latency exceeded threshold', metric: 'trace.http.request.duration', value: 450, threshold: 300, startedAt: '2024-12-20T15:15:00Z', tags: { service: 'api-gateway', endpoint: '/api/orders' } },
  { id: 'a3', name: 'Database Connection Pool', severity: 'info', status: 'pending', message: 'Connection pool usage above 60%', metric: 'postgresql.connections.active', value: 65, threshold: 60, startedAt: '2024-12-20T15:45:00Z', tags: { database: 'primary' } },
  { id: 'a4', name: 'Disk Space Critical', severity: 'critical', status: 'resolved', message: 'Disk space was critically low', metric: 'system.disk.usage', value: 95, threshold: 90, startedAt: '2024-12-20T10:00:00Z', resolvedAt: '2024-12-20T11:30:00Z', tags: { mount: '/data', host: 'db-01' } },
  { id: 'a5', name: 'SSL Certificate Expiry', severity: 'warning', status: 'muted', message: 'SSL certificate expires in 7 days', metric: 'tls.certificate.expiry_days', value: 7, threshold: 14, startedAt: '2024-12-20T00:00:00Z', tags: { domain: 'api.example.com' } }
]

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2024-12-20T15:59:45Z', level: 'error', service: 'api-gateway', host: 'web-01', message: 'Connection timeout to database after 30s', metadata: { requestId: 'req-abc123', userId: 'user-456', db: 'primary' }, traceId: 'trace-789' },
  { id: 'l2', timestamp: '2024-12-20T15:59:30Z', level: 'warn', service: 'auth-service', host: 'web-02', message: 'Failed login attempt from suspicious IP', metadata: { ip: '192.168.1.100', attempts: '5', country: 'RU' } },
  { id: 'l3', timestamp: '2024-12-20T15:59:15Z', level: 'info', service: 'user-service', host: 'web-01', message: 'User profile updated successfully', metadata: { userId: 'user-123', changes: 'email,name' } },
  { id: 'l4', timestamp: '2024-12-20T15:59:00Z', level: 'error', service: 'payment-service', host: 'web-03', message: 'Payment processing failed: insufficient funds', metadata: { orderId: 'ord-xyz', amount: '150.00', currency: 'USD' } },
  { id: 'l5', timestamp: '2024-12-20T15:58:45Z', level: 'info', service: 'notification-service', host: 'worker-01', message: 'Email sent successfully', metadata: { to: 'user@example.com', template: 'welcome' } },
  { id: 'l6', timestamp: '2024-12-20T15:58:30Z', level: 'debug', service: 'cache-service', host: 'cache-01', message: 'Cache hit for key user:123:profile', metadata: { ttl: '3600' } },
  { id: 'l7', timestamp: '2024-12-20T15:58:15Z', level: 'warn', service: 'api-gateway', host: 'web-01', message: 'Rate limit approaching for client', metadata: { clientId: 'client-abc', remaining: '10' } },
  { id: 'l8', timestamp: '2024-12-20T15:58:00Z', level: 'fatal', service: 'worker-service', host: 'worker-02', message: 'Worker process crashed unexpectedly', metadata: { pid: '12345', signal: 'SIGSEGV' } }
]

const mockServices: ServiceHealth[] = [
  { id: 's1', name: 'API Gateway', status: 'healthy', uptime: 99.98, latency: 45, errorRate: 0.02, requestsPerSecond: 2500, apdex: 0.95, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Auth Service', status: 'healthy' }, { name: 'Redis', status: 'healthy' }] },
  { id: 's2', name: 'Auth Service', status: 'healthy', uptime: 99.99, latency: 12, errorRate: 0.01, requestsPerSecond: 1200, apdex: 0.98, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'PostgreSQL', status: 'healthy' }] },
  { id: 's3', name: 'User Service', status: 'degraded', uptime: 99.5, latency: 156, errorRate: 0.8, requestsPerSecond: 850, apdex: 0.82, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'PostgreSQL', status: 'healthy' }, { name: 'Redis', status: 'degraded' }] },
  { id: 's4', name: 'Payment Service', status: 'healthy', uptime: 99.95, latency: 230, errorRate: 0.15, requestsPerSecond: 320, apdex: 0.91, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'Stripe API', status: 'healthy' }] },
  { id: 's5', name: 'Notification Service', status: 'healthy', uptime: 99.9, latency: 89, errorRate: 0.05, requestsPerSecond: 450, apdex: 0.94, lastChecked: '2024-12-20T15:59:00Z', dependencies: [{ name: 'SendGrid', status: 'healthy' }, { name: 'Twilio', status: 'healthy' }] },
  { id: 's6', name: 'Worker Service', status: 'down', uptime: 98.5, latency: 0, errorRate: 100, requestsPerSecond: 0, apdex: 0, lastChecked: '2024-12-20T15:58:00Z', dependencies: [{ name: 'RabbitMQ', status: 'healthy' }] }
]

const mockTraces: Trace[] = [
  { id: 't1', traceId: 'trace-abc123', name: 'POST /api/orders', service: 'api-gateway', duration: 342, status: 'ok', timestamp: '2024-12-20T15:59:45Z', resource: '/api/orders',
    spans: [
      { id: 'sp1', name: 'http.request', service: 'api-gateway', duration: 342, startTime: 0, status: 'ok', resource: 'POST /api/orders', tags: { 'http.method': 'POST', 'http.status_code': '201' } },
      { id: 'sp2', name: 'auth.validate', service: 'auth-service', duration: 12, startTime: 5, status: 'ok', resource: 'validate_token', tags: { userId: 'user-123' } },
      { id: 'sp3', name: 'postgresql.query', service: 'order-service', duration: 156, startTime: 20, status: 'ok', resource: 'INSERT orders', tags: { 'db.type': 'postgresql' } },
      { id: 'sp4', name: 'stripe.charge', service: 'payment-service', duration: 230, startTime: 180, status: 'ok', resource: 'create_charge', tags: { provider: 'stripe' } }
    ]
  },
  { id: 't2', traceId: 'trace-def456', name: 'GET /api/users/:id', service: 'api-gateway', duration: 89, status: 'ok', timestamp: '2024-12-20T15:59:30Z', resource: '/api/users/{id}',
    spans: [
      { id: 'sp6', name: 'http.request', service: 'api-gateway', duration: 89, startTime: 0, status: 'ok', resource: 'GET /api/users/{id}', tags: { 'http.method': 'GET' } },
      { id: 'sp7', name: 'redis.get', service: 'cache-service', duration: 3, startTime: 5, status: 'ok', resource: 'GET user:*', tags: { hit: 'true' } }
    ]
  },
  { id: 't3', traceId: 'trace-ghi789', name: 'POST /api/payments', service: 'api-gateway', duration: 1250, status: 'error', timestamp: '2024-12-20T15:58:15Z', resource: '/api/payments',
    spans: [
      { id: 'sp9', name: 'http.request', service: 'api-gateway', duration: 1250, startTime: 0, status: 'error', resource: 'POST /api/payments', tags: { 'http.status_code': '504' } },
      { id: 'sp10', name: 'stripe.charge', service: 'payment-service', duration: 1200, startTime: 30, status: 'error', resource: 'create_charge', tags: { error: 'timeout' } }
    ]
  }
]

const mockHosts: Host[] = [
  { id: 'h1', name: 'web-01', status: 'running', cpu: 67.5, memory: 82.3, disk: 45, network: { in: 1.24, out: 0.89 }, apps: 5, os: 'Ubuntu 22.04', uptime: '45d 12h' },
  { id: 'h2', name: 'web-02', status: 'running', cpu: 45.2, memory: 68.1, disk: 52, network: { in: 0.98, out: 0.76 }, apps: 5, os: 'Ubuntu 22.04', uptime: '45d 12h' },
  { id: 'h3', name: 'web-03', status: 'warning', cpu: 78.9, memory: 85.4, disk: 71, network: { in: 1.56, out: 1.12 }, apps: 5, os: 'Ubuntu 22.04', uptime: '30d 8h' },
  { id: 'h4', name: 'db-01', status: 'running', cpu: 42.1, memory: 76.5, disk: 68, network: { in: 0.45, out: 0.32 }, apps: 2, os: 'Ubuntu 22.04', uptime: '90d 4h' },
  { id: 'h5', name: 'cache-01', status: 'running', cpu: 23.4, memory: 45.2, disk: 12, network: { in: 2.34, out: 2.01 }, apps: 1, os: 'Alpine 3.18', uptime: '60d 16h' },
  { id: 'h6', name: 'worker-01', status: 'running', cpu: 56.7, memory: 62.3, disk: 34, network: { in: 0.12, out: 0.08 }, apps: 3, os: 'Ubuntu 22.04', uptime: '15d 2h' },
  { id: 'h7', name: 'worker-02', status: 'critical', cpu: 0, memory: 0, disk: 34, network: { in: 0, out: 0 }, apps: 0, os: 'Ubuntu 22.04', uptime: '0h' }
]

const mockAPMServices: APMService[] = [
  { id: 'apm1', name: 'api-gateway', language: 'Node.js', requestCount: 125000, errorRate: 0.02, avgLatency: 45, p99Latency: 180, apdex: 0.95, status: 'healthy' },
  { id: 'apm2', name: 'auth-service', language: 'Go', requestCount: 89000, errorRate: 0.01, avgLatency: 12, p99Latency: 45, apdex: 0.98, status: 'healthy' },
  { id: 'apm3', name: 'user-service', language: 'Python', requestCount: 67000, errorRate: 0.8, avgLatency: 156, p99Latency: 450, apdex: 0.82, status: 'degraded' },
  { id: 'apm4', name: 'payment-service', language: 'Java', requestCount: 23000, errorRate: 0.15, avgLatency: 230, p99Latency: 890, apdex: 0.91, status: 'healthy' },
  { id: 'apm5', name: 'notification-service', language: 'Node.js', requestCount: 45000, errorRate: 0.05, avgLatency: 89, p99Latency: 250, apdex: 0.94, status: 'healthy' },
  { id: 'apm6', name: 'order-service', language: 'Go', requestCount: 34000, errorRate: 0.08, avgLatency: 78, p99Latency: 320, apdex: 0.93, status: 'healthy' }
]

export default function SystemInsightsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('1h')
  const [logLevel, setLogLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)
  const [isLive, setIsLive] = useState(true)

  // Calculate stats
  const stats = useMemo(() => {
    const firing = mockAlerts.filter(a => a.status === 'firing').length
    const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'firing').length
    const healthyServices = mockServices.filter(s => s.status === 'healthy').length
    const avgUptime = mockServices.reduce((sum, s) => sum + s.uptime, 0) / mockServices.length
    const totalRps = mockServices.reduce((sum, s) => sum + s.requestsPerSecond, 0)
    const avgApdex = mockServices.reduce((sum, s) => sum + s.apdex, 0) / mockServices.length

    return {
      firingAlerts: firing,
      criticalAlerts,
      healthyServices,
      totalServices: mockServices.length,
      avgUptime: avgUptime.toFixed(2),
      totalRps,
      errorLogs: mockLogs.filter(l => l.level === 'error' || l.level === 'fatal').length,
      warningMetrics: mockMetrics.filter(m => m.status === 'warning').length,
      totalHosts: mockHosts.length,
      healthyHosts: mockHosts.filter(h => h.status === 'running').length,
      avgApdex: avgApdex.toFixed(2)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'running': case 'ok': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
      case 'degraded': case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      case 'down': case 'critical': case 'error': case 'offline': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      case 'error': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-gray-600 text-gray-100'
      case 'info': return 'bg-blue-600 text-blue-100'
      case 'warn': return 'bg-amber-600 text-amber-100'
      case 'error': return 'bg-red-600 text-red-100'
      case 'fatal': return 'bg-red-800 text-red-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  // Key metrics for header cards
  const keyMetrics = [
    { label: 'Firing Alerts', value: stats.firingAlerts, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', positive: stats.firingAlerts === 0 },
    { label: 'Healthy Services', value: `${stats.healthyServices}/${stats.totalServices}`, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', positive: true },
    { label: 'Avg Uptime', value: `${stats.avgUptime}%`, icon: Activity, gradient: 'from-blue-500 to-blue-600', positive: true },
    { label: 'Total RPS', value: stats.totalRps.toLocaleString(), icon: Zap, gradient: 'from-purple-500 to-purple-600', positive: true },
    { label: 'CPU Usage', value: `${mockMetrics[0].value}%`, icon: Cpu, gradient: 'from-indigo-500 to-indigo-600', positive: mockMetrics[0].status === 'normal' },
    { label: 'Memory', value: `${mockMetrics[1].value}%`, icon: Server, gradient: 'from-amber-500 to-amber-600', positive: mockMetrics[1].status === 'normal' },
    { label: 'Hosts', value: `${stats.healthyHosts}/${stats.totalHosts}`, icon: Box, gradient: 'from-cyan-500 to-cyan-600', positive: true },
    { label: 'Apdex', value: stats.avgApdex, icon: TrendingUp, gradient: 'from-pink-500 to-pink-600', positive: parseFloat(stats.avgApdex) >= 0.9 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-700 to-zinc-700 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-10 w-10" />
                  <Badge className="bg-white/20 text-white border-0">Datadog Level</Badge>
                  {isLive && (
                    <Badge className="bg-emerald-500/30 text-white border-0 animate-pulse">
                      <span className="h-2 w-2 bg-emerald-400 rounded-full mr-1.5 inline-block"></span>
                      Live
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">System Insights</h1>
                <p className="text-white/80">Infrastructure monitoring • APM • Logs • Traces • Alerts</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px] bg-white/20 border-0 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5m">Last 5 min</SelectItem>
                    <SelectItem value="15m">Last 15 min</SelectItem>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="6h">Last 6 hours</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => setIsLive(!isLive)}>
                  {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 8 Gradient Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                    {typeof metric.value === 'number' && metric.value > 0 && !metric.positive ? (
                      <AlertCircle className="h-4 w-4 text-red-300" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    )}
                  </div>
                  <div className="text-xl font-bold">{metric.value}</div>
                  <div className="text-xs text-white/70">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border h-auto flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Activity className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              {stats.firingAlerts > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.firingAlerts}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="traces" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <GitBranch className="h-4 w-4 mr-2" />
              Traces
            </TabsTrigger>
            <TabsTrigger value="apm" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Layers className="h-4 w-4 mr-2" />
              APM
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Server className="h-4 w-4 mr-2" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Health Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Health Map</CardTitle>
                  <CardDescription>Real-time service status and dependencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {mockServices.map(service => (
                      <div key={service.id} className={`p-3 rounded-lg border ${
                        service.status === 'healthy' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' :
                        service.status === 'degraded' ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' :
                        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            service.status === 'healthy' ? 'bg-emerald-500' :
                            service.status === 'degraded' ? 'bg-amber-500' :
                            'bg-red-500'
                          } animate-pulse`} />
                        </div>
                        <div className="text-xs text-gray-500">{service.latency}ms • {service.apdex} apdex</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Active Alerts
                    {stats.firingAlerts > 0 && (
                      <Badge variant="destructive">{stats.firingAlerts}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAlerts.filter(a => a.status === 'firing').slice(0, 4).map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                      'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{alert.name}</span>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                    </div>
                  ))}
                  {mockAlerts.filter(a => a.status === 'firing').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      No active alerts
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics & Logs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {mockMetrics.slice(0, 4).map(metric => (
                      <div key={metric.id} className={`p-4 rounded-lg ${
                        metric.status === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                        metric.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                        'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.name}</div>
                        <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                        <div className={`text-sm mt-1 flex items-center gap-1 ${
                          metric.trend === 'up' ? 'text-red-600' : metric.trend === 'down' ? 'text-emerald-600' : 'text-gray-500'
                        }`}>
                          {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(metric.changePercent)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm">
                    {mockLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <Badge className={`${getLogLevelColor(log.level)} text-xs`}>{log.level}</Badge>
                        <span className="text-blue-600 dark:text-blue-400">[{log.service}]</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockMetrics.map(metric => (
                <Card key={metric.id} className={metric.status !== 'normal' ? 'border-amber-300 dark:border-amber-700' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</span>
                      <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {metric.value}<span className="text-lg text-gray-500">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-sm flex items-center ${metric.trend === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit}
                      </span>
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
                    <div className="mt-2 text-xs text-gray-500">
                      Warn: {metric.thresholds.warning}{metric.unit} • Crit: {metric.thresholds.critical}{metric.unit}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="firing">Firing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="muted">Muted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>

            <div className="space-y-4">
              {mockAlerts.map(alert => (
                <Card key={alert.id} className={
                  alert.status === 'firing' ? (
                    alert.severity === 'critical' ? 'border-red-300 dark:border-red-700' : 'border-amber-300 dark:border-amber-700'
                  ) : ''
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{alert.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(alert.tags).map(([key, value]) => (
                            <span key={key} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                              {key}:{value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{new Date(alert.startedAt).toLocaleString()}</div>
                        <div className="text-lg font-mono mt-1">{alert.value} / {alert.threshold}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search logs..." className="pl-10" />
              </div>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Log Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="fatal">Fatal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Card className="bg-gray-900">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 font-mono text-sm space-y-1">
                    {mockLogs.filter(log => logLevel === 'all' || log.level === logLevel).map(log => (
                      <div key={log.id} className="flex items-start gap-3 hover:bg-gray-800 p-2 rounded">
                        <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                        <Badge className={`${getLogLevelColor(log.level)} text-xs uppercase`}>{log.level}</Badge>
                        <span className="text-cyan-400">[{log.service}]</span>
                        <span className="text-purple-400">@{log.host}</span>
                        <span className="text-gray-300 flex-1">{log.message}</span>
                        {log.traceId && (
                          <span className="text-indigo-400 text-xs cursor-pointer hover:underline">{log.traceId}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traces Tab */}
          <TabsContent value="traces" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by trace ID, service, or resource..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="api-gateway">API Gateway</SelectItem>
                  <SelectItem value="auth-service">Auth Service</SelectItem>
                  <SelectItem value="payment-service">Payment Service</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {mockTraces.map(trace => (
                <Card key={trace.id} className={trace.status === 'error' ? 'border-red-300 dark:border-red-700' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className={`w-3 h-3 rounded-full ${trace.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div>
                          <h3 className="font-semibold">{trace.name}</h3>
                          <div className="text-sm text-gray-500 font-mono">{trace.traceId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{trace.duration}ms</div>
                        <div className="text-sm text-gray-500">{new Date(trace.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      {trace.spans.map((span) => (
                        <div
                          key={span.id}
                          className={`absolute h-6 top-1 rounded ${span.status === 'ok' ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{
                            left: `${(span.startTime / trace.duration) * 100}%`,
                            width: `${Math.max((span.duration / trace.duration) * 100, 2)}%`
                          }}
                          title={`${span.name} - ${span.duration}ms`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{trace.spans.length} spans</span>
                      <span>{trace.service}</span>
                      <span>{trace.resource}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* APM Tab */}
          <TabsContent value="apm" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Application Performance Monitoring</h2>
                <p className="text-gray-500">Real-time service performance and health</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAPMServices.map(service => (
                <Card key={service.id} className={service.status !== 'healthy' ? 'border-amber-300 dark:border-amber-700' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                    </div>
                    <CardDescription>{service.language}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Requests</div>
                        <div className="text-lg font-semibold">{(service.requestCount / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Error Rate</div>
                        <div className={`text-lg font-semibold ${service.errorRate > 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {service.errorRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Latency</div>
                        <div className="text-lg font-semibold">{service.avgLatency}ms</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">P99 Latency</div>
                        <div className="text-lg font-semibold">{service.p99Latency}ms</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Apdex</span>
                      <div className="flex items-center gap-2">
                        <Progress value={service.apdex * 100} className="w-24 h-2" />
                        <span className={`font-semibold ${service.apdex >= 0.9 ? 'text-emerald-600' : service.apdex >= 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                          {service.apdex}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Infrastructure</h2>
                <p className="text-gray-500">Host monitoring and resource utilization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockHosts.map(host => (
                <Card key={host.id} className={
                  host.status === 'critical' || host.status === 'offline' ? 'border-red-300 dark:border-red-700' :
                  host.status === 'warning' ? 'border-amber-300 dark:border-amber-700' : ''
                }>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-gray-400" />
                        <CardTitle className="text-lg">{host.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(host.status)}>{host.status}</Badge>
                    </div>
                    <CardDescription>{host.os} • Uptime: {host.uptime}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">CPU</span>
                          <span className={host.cpu > 80 ? 'text-red-600' : ''}>{host.cpu}%</span>
                        </div>
                        <Progress value={host.cpu} className={`h-2 ${host.cpu > 80 ? '[&>div]:bg-red-500' : ''}`} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Memory</span>
                          <span className={host.memory > 85 ? 'text-red-600' : ''}>{host.memory}%</span>
                        </div>
                        <Progress value={host.memory} className={`h-2 ${host.memory > 85 ? '[&>div]:bg-red-500' : ''}`} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Disk</span>
                          <span className={host.disk > 80 ? 'text-amber-600' : ''}>{host.disk}%</span>
                        </div>
                        <Progress value={host.disk} className={`h-2 ${host.disk > 80 ? '[&>div]:bg-amber-500' : ''}`} />
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-gray-500">Network</span>
                        <span>↓{host.network.in}GB/s ↑{host.network.out}GB/s</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Applications</span>
                        <span>{host.apps} running</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Monitoring Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Collection</CardTitle>
                  <CardDescription>Configure what data to collect</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Infrastructure Metrics</Label>
                      <p className="text-sm text-gray-500">CPU, memory, disk, network</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>APM Traces</Label>
                      <p className="text-sm text-gray-500">Distributed tracing data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log Collection</Label>
                      <p className="text-sm text-gray-500">Application and system logs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real User Monitoring</Label>
                      <p className="text-sm text-gray-500">Browser and mobile performance</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Notifications</CardTitle>
                  <CardDescription>Configure how alerts are delivered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm text-gray-500">team@company.com</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>Slack</Label>
                        <p className="text-sm text-gray-500">#alerts-production</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>PagerDuty</Label>
                        <p className="text-sm text-gray-500">On-call rotation</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label>Webhook</Label>
                        <p className="text-sm text-gray-500">Custom endpoint</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Policy</CardTitle>
                  <CardDescription>Configure data retention periods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label>Metrics Retention</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="15">15 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Logs Retention</Label>
                    <Select defaultValue="15">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="15">15 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Traces Retention</Label>
                    <Select defaultValue="7">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="15">15 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect with external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'AWS CloudWatch', connected: true },
                    { name: 'Kubernetes', connected: true },
                    { name: 'Docker', connected: true },
                    { name: 'Prometheus', connected: false },
                    { name: 'Grafana', connected: false }
                  ].map((integration, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <Box className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agent Installation</CardTitle>
                <CardDescription>Install the monitoring agent on your hosts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`# Install the Kazi monitoring agent
curl -sL https://install.kazi.app/agent | bash -s -- --api-key=KAZI-XXXXXXXX

# Or using Docker
docker run -d --name kazi-agent \\
  -e KAZI_API_KEY=KAZI-XXXXXXXX \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v /proc/:/host/proc/:ro \\
  -v /sys/:/host/sys/:ro \\
  kazi/agent:latest`}</pre>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Command
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
