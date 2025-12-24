'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FolderOpen,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Download,
  Share2,
  Star,
  StarOff,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Layers,
  Box,
  GitBranch,
  Cloud,
  Shield,
  Lock,
  Unlock,
  Play,
  Pause,
  ExternalLink,
  Copy,
  Maximize2,
  Minimize2,
  Grid,
  List,
  MapPin,
  Gauge
} from 'lucide-react'

// Types
type MetricStatus = 'healthy' | 'warning' | 'critical' | 'unknown'
type TimeRange = '1h' | '4h' | '24h' | '7d' | '30d' | 'custom'
type AlertSeverity = 'critical' | 'warning' | 'info'
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Metric {
  id: string
  name: string
  value: number
  unit: string
  change: number
  changePercent: number
  status: MetricStatus
  sparkline: number[]
  lastUpdated: string
}

interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  service: string
  metric: string
  threshold: number
  currentValue: number
  triggeredAt: string
  acknowledgedBy?: string
  resolvedAt?: string
  status: 'triggered' | 'acknowledged' | 'resolved'
}

interface Service {
  id: string
  name: string
  status: ServiceStatus
  uptime: number
  responseTime: number
  errorRate: number
  requestsPerMinute: number
  region: string
  lastIncident?: string
  dependencies: string[]
}

interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'status' | 'list'
  title: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: { x: number; y: number }
  config: Record<string, any>
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  recentActivity: string
}

// Mock Data
const mockMetrics: Metric[] = [
  { id: 'm1', name: 'Total Revenue', value: 284500, unit: '$', change: 12500, changePercent: 4.6, status: 'healthy', sparkline: [65, 72, 68, 75, 82, 78, 85, 90, 88, 92, 95, 98], lastUpdated: '2024-01-15T14:30:00Z' },
  { id: 'm2', name: 'Active Users', value: 12847, unit: '', change: 847, changePercent: 7.1, status: 'healthy', sparkline: [100, 105, 110, 108, 115, 120, 118, 125, 130, 128, 135, 140], lastUpdated: '2024-01-15T14:30:00Z' },
  { id: 'm3', name: 'API Requests/min', value: 45200, unit: '', change: -2100, changePercent: -4.4, status: 'warning', sparkline: [50, 52, 48, 55, 53, 51, 49, 47, 45, 46, 44, 45], lastUpdated: '2024-01-15T14:30:00Z' },
  { id: 'm4', name: 'Error Rate', value: 0.12, unit: '%', change: -0.03, changePercent: -20, status: 'healthy', sparkline: [0.2, 0.18, 0.15, 0.14, 0.13, 0.12, 0.11, 0.12, 0.11, 0.12, 0.12, 0.12], lastUpdated: '2024-01-15T14:30:00Z' },
  { id: 'm5', name: 'Response Time', value: 145, unit: 'ms', change: 12, changePercent: 9, status: 'warning', sparkline: [120, 125, 130, 128, 135, 140, 138, 142, 145, 143, 146, 145], lastUpdated: '2024-01-15T14:30:00Z' },
  { id: 'm6', name: 'CPU Usage', value: 67, unit: '%', change: 5, changePercent: 8.1, status: 'healthy', sparkline: [55, 58, 62, 60, 65, 63, 68, 66, 70, 68, 67, 67], lastUpdated: '2024-01-15T14:30:00Z' }
]

const mockAlerts: Alert[] = [
  {
    id: 'a1',
    title: 'High Response Time',
    message: 'API response time exceeded threshold of 200ms',
    severity: 'warning',
    service: 'API Gateway',
    metric: 'response_time_p95',
    threshold: 200,
    currentValue: 245,
    triggeredAt: '2024-01-15T14:25:00Z',
    status: 'triggered'
  },
  {
    id: 'a2',
    title: 'Database Connection Pool',
    message: 'Connection pool utilization at 85%',
    severity: 'warning',
    service: 'PostgreSQL',
    metric: 'connection_pool_usage',
    threshold: 80,
    currentValue: 85,
    triggeredAt: '2024-01-15T14:20:00Z',
    acknowledgedBy: 'john.doe',
    status: 'acknowledged'
  },
  {
    id: 'a3',
    title: 'SSL Certificate Expiring',
    message: 'Certificate expires in 14 days',
    severity: 'info',
    service: 'CDN',
    metric: 'ssl_days_remaining',
    threshold: 30,
    currentValue: 14,
    triggeredAt: '2024-01-15T10:00:00Z',
    status: 'triggered'
  },
  {
    id: 'a4',
    title: 'Memory Usage Critical',
    message: 'Memory usage exceeded 90% threshold',
    severity: 'critical',
    service: 'Worker Nodes',
    metric: 'memory_usage_percent',
    threshold: 90,
    currentValue: 92,
    triggeredAt: '2024-01-15T14:28:00Z',
    status: 'triggered'
  }
]

const mockServices: Service[] = [
  { id: 's1', name: 'API Gateway', status: 'operational', uptime: 99.98, responseTime: 45, errorRate: 0.02, requestsPerMinute: 12500, region: 'us-east-1', dependencies: ['Auth Service', 'Database'] },
  { id: 's2', name: 'Auth Service', status: 'operational', uptime: 99.99, responseTime: 23, errorRate: 0.01, requestsPerMinute: 8400, region: 'us-east-1', dependencies: ['Database', 'Redis'] },
  { id: 's3', name: 'Database', status: 'operational', uptime: 99.95, responseTime: 12, errorRate: 0.00, requestsPerMinute: 25000, region: 'us-east-1', dependencies: [] },
  { id: 's4', name: 'Worker Nodes', status: 'degraded', uptime: 99.85, responseTime: 156, errorRate: 0.15, requestsPerMinute: 5200, region: 'us-east-1', lastIncident: '2024-01-15T14:28:00Z', dependencies: ['Database', 'Redis', 'Queue'] },
  { id: 's5', name: 'CDN', status: 'operational', uptime: 99.99, responseTime: 8, errorRate: 0.00, requestsPerMinute: 85000, region: 'global', dependencies: [] },
  { id: 's6', name: 'Redis Cache', status: 'operational', uptime: 99.97, responseTime: 2, errorRate: 0.00, requestsPerMinute: 150000, region: 'us-east-1', dependencies: [] }
]

const mockTeam: TeamMember[] = [
  { id: 't1', name: 'Sarah Chen', role: 'Product Manager', status: 'online', recentActivity: 'Updated roadmap' },
  { id: 't2', name: 'Mike Johnson', role: 'Senior Developer', status: 'online', recentActivity: 'Deployed v2.5.0' },
  { id: 't3', name: 'Emily Davis', role: 'Designer', status: 'away', recentActivity: 'Updated UI components' },
  { id: 't4', name: 'Alex Kim', role: 'DevOps Engineer', status: 'online', recentActivity: 'Acknowledged alert' }
]

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' }
]

export default function OverviewClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const getStatusColor = (status: MetricStatus | ServiceStatus) => {
    switch (status) {
      case 'healthy': case 'operational': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'warning': case 'degraded': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'critical': case 'outage': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'maintenance': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800'
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
      default: return 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') return `$${value.toLocaleString()}`
    if (unit === '%') return `${value}%`
    if (unit === 'ms') return `${value}ms`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Calculate summary stats
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'triggered').length
  const warningAlerts = mockAlerts.filter(a => a.severity === 'warning' && a.status === 'triggered').length
  const healthyServices = mockServices.filter(s => s.status === 'operational').length
  const overallUptime = (mockServices.reduce((sum, s) => sum + s.uptime, 0) / mockServices.length).toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-white/80">Real-time monitoring & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center bg-white/10 rounded-lg p-1">
                {timeRanges.map(range => (
                  <Button
                    key={range.value}
                    variant="ghost"
                    size="sm"
                    className={`${timeRange === range.value ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    onClick={() => setTimeRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleRefresh}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Server className="w-4 h-4" />
                <span className="text-sm">Services</span>
              </div>
              <p className="text-2xl font-bold">{healthyServices}/{mockServices.length}</p>
              <p className="text-xs text-green-300">All operational</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Uptime</span>
              </div>
              <p className="text-2xl font-bold">{overallUptime}%</p>
              <p className="text-xs text-green-300">Last 30 days</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Active Alerts</span>
              </div>
              <p className="text-2xl font-bold">{criticalAlerts + warningAlerts}</p>
              <p className="text-xs text-yellow-300">{criticalAlerts} critical, {warningAlerts} warning</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Team Online</span>
              </div>
              <p className="text-2xl font-bold">{mockTeam.filter(m => m.status === 'online').length}/{mockTeam.length}</p>
              <p className="text-xs text-white/60">Active now</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="rounded-lg">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg">
              <Server className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
              {criticalAlerts > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{criticalAlerts}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockMetrics.map(metric => (
                <Card key={metric.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.name}</span>
                      <Badge className={getStatusColor(metric.status)} variant="outline">
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {metric.changePercent > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                      </span>
                    </div>
                    {/* Mini Sparkline */}
                    <div className="flex items-end gap-0.5 h-8 mt-3">
                      {metric.sparkline.map((value, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t"
                          style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Revenue Trend
                    </span>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
                      <p className="text-muted-foreground">Revenue chart visualization</p>
                      <p className="text-2xl font-bold mt-2">$284,500</p>
                      <p className="text-sm text-green-600">+4.6% vs last period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Traffic Sources
                    </span>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {[
                        { name: 'Direct', value: 35, color: 'bg-indigo-500' },
                        { name: 'Organic', value: 28, color: 'bg-purple-500' },
                        { name: 'Referral', value: 22, color: 'bg-pink-500' },
                        { name: 'Social', value: 15, color: 'bg-orange-500' }
                      ].map(source => (
                        <div key={source.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${source.color}`} />
                            <span className="text-sm">{source.name}</span>
                          </div>
                          <p className="text-xl font-bold">{source.value}%</p>
                          <Progress value={source.value} className="h-1 mt-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services & Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockServices.slice(0, 4).map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'operational' ? 'bg-green-500' :
                            service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.region}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="font-medium">{service.uptime}%</p>
                            <p className="text-xs text-muted-foreground">Uptime</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{service.responseTime}ms</p>
                            <p className="text-xs text-muted-foreground">Response</p>
                          </div>
                          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTeam.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.recentActivity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockMetrics.map(metric => (
                    <div key={metric.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{metric.name}</h4>
                        <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                      </div>
                      <p className="text-3xl font-bold mb-2">{formatValue(metric.value, metric.unit)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {metric.changePercent > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={metric.changePercent > 0 ? 'text-green-600' : 'text-red-600'}>
                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(metric.lastUpdated)}</span>
                      </div>
                      <div className="flex items-end gap-0.5 h-12 mt-4">
                        {metric.sparkline.map((value, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t"
                            style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockServices.map(service => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                            <Server className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">{service.region}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Uptime</p>
                          <p className="font-semibold text-lg">{service.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Response Time</p>
                          <p className="font-semibold text-lg">{service.responseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Error Rate</p>
                          <p className="font-semibold text-lg">{service.errorRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requests/min</p>
                          <p className="font-semibold text-lg">{service.requestsPerMinute.toLocaleString()}</p>
                        </div>
                      </div>
                      {service.dependencies.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Dependencies</p>
                          <div className="flex gap-2">
                            {service.dependencies.map(dep => (
                              <Badge key={dep} variant="outline">{dep}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Alerts</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAlerts.map(alert => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm opacity-80">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{alert.status}</Badge>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span>Service: {alert.service}</span>
                          <span>Metric: {alert.metric}</span>
                          <span>Current: {alert.currentValue} (threshold: {alert.threshold})</span>
                        </div>
                        <span className="text-xs opacity-70">{formatTimeAgo(alert.triggeredAt)}</span>
                      </div>
                      {alert.acknowledgedBy && (
                        <p className="mt-2 text-xs opacity-70">
                          Acknowledged by {alert.acknowledgedBy}
                        </p>
                      )}
                    </div>
                  ))}

                  {filteredAlerts.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">All Clear</h3>
                      <p className="text-muted-foreground">No active alerts at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
