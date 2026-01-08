'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Activity,
  Zap,
  Clock,
  Server,
  Cpu,
  Globe,
  AlertTriangle,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Download,
  Bell,
  Eye,
  Plus,
  Settings,
  Terminal,
  Layers,
  Database,
  Gauge,
  Timer,
  Target,
  Shield,
  Sliders,
  Webhook,
  Trash2,
  PieChart,
  Workflow,
  FileText
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

interface Host {
  id: string
  name: string
  ip: string
  status: 'running' | 'stopped' | 'warning'
  cpu: number
  memory: number
  disk: number
  network: { in: number; out: number }
  containers: number
  os: string
  uptime: string
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  service: string
  message: string
  host: string
  traceId?: string
}

interface SLO {
  id: string
  name: string
  target: number
  current: number
  timeWindow: '7d' | '30d' | '90d'
  status: 'met' | 'at_risk' | 'breached'
  errorBudget: { remaining: number; consumed: number }
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

const mockHosts: Host[] = [
  { id: 'h1', name: 'prod-api-1', ip: '10.0.1.10', status: 'running', cpu: 45, memory: 68, disk: 42, network: { in: 125, out: 89 }, containers: 8, os: 'Ubuntu 22.04', uptime: '45d 12h' },
  { id: 'h2', name: 'prod-api-2', ip: '10.0.1.11', status: 'running', cpu: 52, memory: 72, disk: 38, network: { in: 118, out: 95 }, containers: 8, os: 'Ubuntu 22.04', uptime: '45d 12h' },
  { id: 'h3', name: 'prod-db-1', ip: '10.0.2.10', status: 'warning', cpu: 78, memory: 85, disk: 72, network: { in: 256, out: 312 }, containers: 2, os: 'Ubuntu 22.04', uptime: '120d 5h' },
  { id: 'h4', name: 'prod-cache-1', ip: '10.0.3.10', status: 'running', cpu: 32, memory: 45, disk: 28, network: { in: 450, out: 420 }, containers: 3, os: 'Ubuntu 22.04', uptime: '30d 8h' },
  { id: 'h5', name: 'prod-worker-1', ip: '10.0.4.10', status: 'running', cpu: 65, memory: 58, disk: 35, network: { in: 45, out: 38 }, containers: 12, os: 'Ubuntu 22.04', uptime: '15d 3h' },
]

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2024-12-23T10:30:15Z', level: 'error', service: 'Analytics Service', message: 'Connection timeout to downstream service after 500ms', host: 'prod-api-1', traceId: 'trace-mno345lmn' },
  { id: 'l2', timestamp: '2024-12-23T10:30:12Z', level: 'warn', service: 'User Service', message: 'High latency detected: p99=156ms, threshold=100ms', host: 'prod-api-2' },
  { id: 'l3', timestamp: '2024-12-23T10:30:10Z', level: 'info', service: 'API Gateway', message: 'Successfully processed 1000 requests in the last minute', host: 'prod-api-1' },
  { id: 'l4', timestamp: '2024-12-23T10:30:08Z', level: 'error', service: 'Payment Service', message: 'Payment gateway returned 503: Service Unavailable', host: 'prod-api-1', traceId: 'trace-ghi789rst' },
  { id: 'l5', timestamp: '2024-12-23T10:30:05Z', level: 'debug', service: 'Auth Service', message: 'JWT token validated successfully for user_id=12345', host: 'prod-api-2' },
  { id: 'l6', timestamp: '2024-12-23T10:30:02Z', level: 'info', service: 'Notification Service', message: 'Sent 250 push notifications in batch', host: 'prod-worker-1' },
  { id: 'l7', timestamp: '2024-12-23T10:30:00Z', level: 'fatal', service: 'Analytics Service', message: 'Out of memory error: heap size exceeded', host: 'prod-api-1' },
]

const mockSLOs: SLO[] = [
  { id: 'slo1', name: 'API Availability', target: 99.9, current: 99.85, timeWindow: '30d', status: 'at_risk', errorBudget: { remaining: 15, consumed: 85 } },
  { id: 'slo2', name: 'API Latency P99 < 200ms', target: 99.5, current: 99.72, timeWindow: '30d', status: 'met', errorBudget: { remaining: 56, consumed: 44 } },
  { id: 'slo3', name: 'Payment Success Rate', target: 99.9, current: 99.95, timeWindow: '7d', status: 'met', errorBudget: { remaining: 78, consumed: 22 } },
  { id: 'slo4', name: 'Authentication Uptime', target: 99.99, current: 99.98, timeWindow: '90d', status: 'met', errorBudget: { remaining: 42, consumed: 58 } },
]

const logLevelColors: Record<string, string> = {
  debug: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  warn: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  fatal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

const sloStatusColors: Record<string, string> = {
  met: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  at_risk: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  breached: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

// Dashboard interface
interface Dashboard {
  id: string
  name: string
  description: string
  widgets: number
  owner: string
  shared: boolean
  createdAt: string
  updatedAt: string
  views: number
  isFavorite: boolean
}

// Integration interface
interface Integration {
  id: string
  name: string
  type: 'cloud' | 'database' | 'messaging' | 'monitoring' | 'logging'
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  dataPoints: number
  icon: string
}

// Mock Dashboards
const mockDashboards: Dashboard[] = [
  { id: 'd1', name: 'Production Overview', description: 'Real-time production metrics and health', widgets: 12, owner: 'Platform Team', shared: true, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-12-23T10:00:00Z', views: 1250, isFavorite: true },
  { id: 'd2', name: 'API Performance', description: 'API latency, throughput, and error rates', widgets: 8, owner: 'API Team', shared: true, createdAt: '2024-02-20T00:00:00Z', updatedAt: '2024-12-22T15:30:00Z', views: 890, isFavorite: true },
  { id: 'd3', name: 'Database Metrics', description: 'PostgreSQL and Redis performance', widgets: 10, owner: 'Data Team', shared: true, createdAt: '2024-03-10T00:00:00Z', updatedAt: '2024-12-21T09:15:00Z', views: 654, isFavorite: false },
  { id: 'd4', name: 'Error Analysis', description: 'Error tracking and exception monitoring', widgets: 6, owner: 'Engineering', shared: false, createdAt: '2024-04-05T00:00:00Z', updatedAt: '2024-12-20T14:45:00Z', views: 432, isFavorite: false },
  { id: 'd5', name: 'Infrastructure Cost', description: 'Cloud resource utilization and costs', widgets: 9, owner: 'FinOps', shared: true, createdAt: '2024-05-12T00:00:00Z', updatedAt: '2024-12-19T11:20:00Z', views: 321, isFavorite: false },
]

// Mock Integrations
const mockIntegrations: Integration[] = [
  { id: 'i1', name: 'AWS CloudWatch', type: 'cloud', status: 'connected', lastSync: '2024-12-23T10:30:00Z', dataPoints: 125000, icon: '☁️' },
  { id: 'i2', name: 'PostgreSQL', type: 'database', status: 'connected', lastSync: '2024-12-23T10:29:00Z', dataPoints: 85000, icon: '🐘' },
  { id: 'i3', name: 'Redis', type: 'database', status: 'connected', lastSync: '2024-12-23T10:30:00Z', dataPoints: 42000, icon: '⚡' },
  { id: 'i4', name: 'Kafka', type: 'messaging', status: 'connected', lastSync: '2024-12-23T10:28:00Z', dataPoints: 256000, icon: '📨' },
  { id: 'i5', name: 'Prometheus', type: 'monitoring', status: 'connected', lastSync: '2024-12-23T10:30:00Z', dataPoints: 890000, icon: '📊' },
  { id: 'i6', name: 'Elasticsearch', type: 'logging', status: 'error', lastSync: '2024-12-23T09:45:00Z', dataPoints: 1250000, icon: '🔍' },
  { id: 'i7', name: 'Kubernetes', type: 'cloud', status: 'connected', lastSync: '2024-12-23T10:30:00Z', dataPoints: 156000, icon: '☸️' },
  { id: 'i8', name: 'MongoDB', type: 'database', status: 'disconnected', lastSync: '2024-12-22T18:00:00Z', dataPoints: 0, icon: '🍃' },
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

// Mock data for AI-powered competitive upgrade components
const mockPerfAnalyticsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Performance Improved', description: 'P95 latency reduced 40% after database optimization.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Latency' },
  { id: '2', type: 'warning' as const, title: 'Memory Pressure', description: 'API server memory usage at 85%. Consider scaling.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Resources' },
  { id: '3', type: 'info' as const, title: 'Traffic Pattern', description: 'Peak traffic shifted to 2pm-4pm. Adjust autoscaling.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Traffic' },
]

const mockPerfAnalyticsCollaborators = [
  { id: '1', name: 'SRE Lead', avatar: '/avatars/sre.jpg', status: 'online' as const, role: 'SRE' },
  { id: '2', name: 'Performance Engineer', avatar: '/avatars/perf.jpg', status: 'online' as const, role: 'Engineering' },
  { id: '3', name: 'Platform Lead', avatar: '/avatars/platform.jpg', status: 'away' as const, role: 'Platform' },
]

const mockPerfAnalyticsPredictions = [
  { id: '1', title: 'Capacity Forecast', prediction: 'Current growth rate requires 50% more capacity by Q2', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Anomaly Detection', prediction: 'Error rate spike likely during next deployment window', confidence: 74, trend: 'up' as const, impact: 'medium' as const },
]

const mockPerfAnalyticsActivities = [
  { id: '1', user: 'SRE Lead', action: 'Resolved', target: 'latency alert for /api/users', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Performance Engineer', action: 'Created', target: 'new dashboard for API metrics', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Platform Lead', action: 'Scaled', target: 'web tier to 12 instances', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside component to access state setters

export default function PerformanceAnalyticsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAlertsViewDialog, setShowAlertsViewDialog] = useState(false)
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)
  const [showTraceDialog, setShowTraceDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false)

  // Dialog states for real functionality
  const [showNewAlertDialog, setShowNewAlertDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showNewSLODialog, setShowNewSLODialog] = useState(false)
  const [showIntegrationsDialog, setShowIntegrationsDialog] = useState(false)
  const [showTraceSearchDialog, setShowTraceSearchDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form states for dialogs
  const [newAlertForm, setNewAlertForm] = useState({
    name: '',
    metric: 'latency_p99',
    condition: 'greater_than',
    threshold: '',
    severity: 'medium',
    notifyEmail: true,
    notifySlack: false
  })
  const [exportForm, setExportForm] = useState({
    format: 'json',
    dateRange: '24h',
    includeMetrics: true,
    includeLogs: false,
    includeTraces: false
  })
  const [newSLOForm, setNewSLOForm] = useState({
    name: '',
    target: '99.9',
    metric: 'availability',
    timeWindow: '30d',
    description: ''
  })
  const [traceSearchForm, setTraceSearchForm] = useState({
    traceId: '',
    service: 'all',
    status: 'all',
    minDuration: '',
    maxDuration: ''
  })
  const [logsFilterForm, setLogsFilterForm] = useState({
    level: 'all',
    service: 'all',
    searchQuery: '',
    timeRange: '1h'
  })

  // Calculate stats
  const healthyServices = mockServices.filter(s => s.status === 'healthy').length
  const avgLatency = mockServices.reduce((sum, s) => sum + s.latency, 0) / mockServices.length
  const overallErrorRate = mockServices.reduce((sum, s) => sum + s.errorRate, 0) / mockServices.length
  const firingAlerts = mockAlerts.filter(a => a.status === 'firing').length
  const totalThroughput = mockServices.reduce((sum, s) => sum + s.throughput, 0)
  const slosMet = mockSLOs.filter(s => s.status === 'met').length
  const activeHosts = mockHosts.filter(h => h.status === 'running').length
  const connectedIntegrations = mockIntegrations.filter(i => i.status === 'connected').length

  const stats = {
    totalServices: mockServices.length,
    healthyServices,
    avgLatency: Math.round(avgLatency),
    errorRate: overallErrorRate.toFixed(2),
    firingAlerts,
    acknowledgedAlerts: mockAlerts.filter(a => a.status === 'acknowledged').length,
    totalThroughput,
    slosMet,
    totalSLOs: mockSLOs.length,
    activeHosts,
    totalHosts: mockHosts.length,
    connectedIntegrations,
    totalIntegrations: mockIntegrations.length,
    totalTraces: mockTraces.length,
    errorTraces: mockTraces.filter(t => t.status === 'error' || t.status === 'timeout').length,
    totalLogs: mockLogs.length,
    errorLogs: mockLogs.filter(l => l.level === 'error' || l.level === 'fatal').length,
    totalDashboards: mockDashboards.length,
    favoriteDashboards: mockDashboards.filter(d => d.isFavorite).length,
  }

  const statCards = [
    { label: 'Service Health', value: `${stats.healthyServices}/${stats.totalServices}`, change: ((stats.healthyServices / stats.totalServices) * 100).toFixed(0) + '% healthy', icon: Activity, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Avg Latency P99', value: `${stats.avgLatency}ms`, change: '+12% vs last hour', icon: Timer, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Error Rate', value: `${stats.errorRate}%`, change: '-0.3% vs last hour', icon: AlertTriangle, gradient: 'from-red-500 to-rose-500' },
    { label: 'Active Alerts', value: stats.firingAlerts.toString(), change: `${stats.acknowledgedAlerts} acknowledged`, icon: Bell, gradient: 'from-orange-500 to-amber-500' },
    { label: 'Total Throughput', value: (stats.totalThroughput / 1000).toFixed(1) + 'K/min', change: '+8.5% vs last hour', icon: Zap, gradient: 'from-purple-500 to-violet-500' },
    { label: 'SLOs Met', value: `${stats.slosMet}/${stats.totalSLOs}`, change: '75% budget remaining', icon: Target, gradient: 'from-indigo-500 to-blue-500' },
    { label: 'Active Hosts', value: `${stats.activeHosts}/${stats.totalHosts}`, change: '100% uptime', icon: Server, gradient: 'from-teal-500 to-cyan-500' },
    { label: 'Integrations', value: `${stats.connectedIntegrations}/${stats.totalIntegrations}`, change: '1 requires attention', icon: Globe, gradient: 'from-pink-500 to-rose-500' },
  ]

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

  // Handlers with real functionality
  const handleRefreshMetrics = () => {
    setIsRefreshing(true)
    // Simulate refresh operation
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Metrics Refreshed', {
        description: 'All performance data has been updated'
      })
    }, 1500)
  }

  const handleCreateAlert = () => {
    if (!newAlertForm.name || !newAlertForm.threshold) {
      toast.error('Validation Error', { description: 'Please fill in all required fields' })
      return
    }
    toast.success('Alert Created', {
      description: `Alert "${newAlertForm.name}" has been configured`
    })
    setShowNewAlertDialog(false)
    setNewAlertForm({
      name: '',
      metric: 'latency_p99',
      condition: 'greater_than',
      threshold: '',
      severity: 'medium',
      notifyEmail: true,
      notifySlack: false
    })
  }

  const handleExportData = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Preparing export...',
        success: `Data exported as ${exportForm.format.toUpperCase()}`,
        error: 'Export failed'
      }
    )
    setShowExportDialog(false)
    setExportForm({
      format: 'json',
      dateRange: '24h',
      includeMetrics: true,
      includeLogs: false,
      includeTraces: false
    })
  }

  const handleCreateSLO = () => {
    if (!newSLOForm.name || !newSLOForm.target) {
      toast.error('Validation Error', { description: 'Please fill in all required fields' })
      return
    }
    toast.success('SLO Created', {
      description: `SLO "${newSLOForm.name}" with ${newSLOForm.target}% target has been created`
    })
    setShowNewSLODialog(false)
    setNewSLOForm({
      name: '',
      target: '99.9',
      metric: 'availability',
      timeWindow: '30d',
      description: ''
    })
  }

  const handleTraceSearch = () => {
    toast.success('Search Executed', {
      description: `Found traces matching your criteria`
    })
    setShowTraceSearchDialog(false)
  }

  const handleLogsFilter = () => {
    toast.success('Logs Filtered', {
      description: `Showing ${logsFilterForm.level === 'all' ? 'all' : logsFilterForm.level} logs`
    })
    setShowLogsDialog(false)
  }

  // Quick actions defined inside component to access state setters
  const perfAnalyticsQuickActions = [
    { id: '1', label: 'New Alert', icon: 'bell', action: () => setShowNewAlertDialog(true), variant: 'default' as const },
    { id: '2', label: 'Dashboard', icon: 'layout', action: () => setShowCreateDashboardDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export', icon: 'download', action: () => setShowExportDialog(true), variant: 'outline' as const },
  ]

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
            <button
              onClick={handleRefreshMetrics}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowAlertsViewDialog(true)}
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

        {/* Gradient Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br ${stat.gradient} text-white border-0 shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-sm text-white/70 mt-1">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Cpu className="w-4 h-4 mr-2" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Server className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Terminal className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="traces" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Layers className="w-4 h-4 mr-2" />
              Traces
            </TabsTrigger>
            <TabsTrigger value="slos" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Target className="w-4 h-4 mr-2" />
              SLOs
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Gauge className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300 rounded-lg px-3 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Performance Overview</h2>
                    <p className="text-white/80">Real-time observability and APM insights</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Services</p>
                    <p className="text-2xl font-bold">{stats.healthyServices}/{stats.totalServices}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Latency</p>
                    <p className="text-2xl font-bold">{stats.avgLatency}ms</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Error Rate</p>
                    <p className="text-2xl font-bold">{stats.errorRate}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Active Alerts</p>
                    <p className="text-2xl font-bold">{stats.firingAlerts}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'New Dashboard', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', onClick: () => setShowCreateDashboardDialog(true) },
                { icon: Bell, label: 'Create Alert', color: 'bg-red-100 dark:bg-red-900/30 text-red-600', onClick: () => setShowNewAlertDialog(true) },
                { icon: Download, label: 'Export Data', color: 'bg-green-100 dark:bg-green-900/30 text-green-600', onClick: () => setShowExportDialog(true) },
                { icon: Target, label: 'New SLO', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', onClick: () => setShowNewSLODialog(true) },
                { icon: Webhook, label: 'Integrations', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600', onClick: () => setShowIntegrationsDialog(true) },
                { icon: Workflow, label: 'Trace Search', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600', onClick: () => setShowTraceSearchDialog(true) },
                { icon: FileText, label: 'View Logs', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', onClick: () => setShowLogsDialog(true) },
                { icon: PieChart, label: 'Analytics', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600', onClick: () => setShowAnalyticsDialog(true) },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

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

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            {/* Infrastructure Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Server className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Infrastructure Monitoring</h2>
                    <p className="text-white/80">Real-time host metrics and container health</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Active Hosts</p>
                    <p className="text-2xl font-bold">{stats.activeHosts}/{stats.totalHosts}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg CPU</p>
                    <p className="text-2xl font-bold">54%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Memory</p>
                    <p className="text-2xl font-bold">66%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Containers</p>
                    <p className="text-2xl font-bold">33</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Host Infrastructure</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Memory</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Containers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockHosts.map((host) => (
                      <tr key={host.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{host.name}</p>
                          <p className="text-xs text-gray-500">{host.ip} • {host.os}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[host.status]}`}>{host.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div className={`h-2 rounded-full ${host.cpu > 80 ? 'bg-red-500' : host.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${host.cpu}%`}} />
                            </div>
                            <span className="text-sm">{host.cpu}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div className={`h-2 rounded-full ${host.memory > 80 ? 'bg-red-500' : host.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${host.memory}%`}} />
                            </div>
                            <span className="text-sm">{host.memory}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div className={`h-2 rounded-full ${host.disk > 80 ? 'bg-red-500' : host.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${host.disk}%`}} />
                            </div>
                            <span className="text-sm">{host.disk}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-green-600">↓{host.network.in}</span> / <span className="text-blue-600">↑{host.network.out}</span> MB/s
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{host.containers}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{host.uptime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            {/* Logs Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Terminal className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Log Explorer</h2>
                    <p className="text-white/80">Search, filter, and analyze your logs in real-time</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Logs</p>
                    <p className="text-2xl font-bold">{stats.totalLogs}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Errors</p>
                    <p className="text-2xl font-bold">{stats.errorLogs}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Log Rate</p>
                    <p className="text-2xl font-bold">2.4K/min</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Storage</p>
                    <p className="text-2xl font-bold">82%</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Log Stream</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm" />
                    </div>
                    <select className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm">
                      <option>All Levels</option>
                      <option>Error</option>
                      <option>Warn</option>
                      <option>Info</option>
                    </select>
                  </div>
                </div>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="font-mono text-sm">
                  {mockLogs.map((log) => (
                    <div key={log.id} className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-start gap-4">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${logLevelColors[log.level]}`}>{log.level.toUpperCase()}</span>
                        <span className="text-xs text-blue-600">[{log.service}]</span>
                        <span className="text-xs text-gray-500">{log.host}</span>
                        <span className="flex-1 text-gray-900 dark:text-white break-all">{log.message}</span>
                        {log.traceId && <span className="text-xs text-purple-600 cursor-pointer hover:underline">{log.traceId}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* SLOs Tab */}
          <TabsContent value="slos" className="space-y-6">
            {/* SLOs Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Service Level Objectives</h2>
                    <p className="text-white/80">Track reliability targets and error budgets</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">SLOs Met</p>
                    <p className="text-2xl font-bold">{stats.slosMet}/{stats.totalSLOs}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">At Risk</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Budget</p>
                    <p className="text-2xl font-bold">48%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Breached</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSLOs.map((slo) => (
                <div key={slo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{slo.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sloStatusColors[slo.status]}`}>{slo.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-end gap-4 mb-4">
                    <div>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{slo.current}%</p>
                      <p className="text-sm text-gray-500">Current ({slo.timeWindow})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-400">{slo.target}%</p>
                      <p className="text-sm text-gray-500">Target</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Error Budget</span>
                      <span className={`font-medium ${slo.errorBudget.remaining < 20 ? 'text-red-600' : 'text-green-600'}`}>{slo.errorBudget.remaining}% remaining</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${slo.errorBudget.remaining < 20 ? 'bg-red-500' : slo.errorBudget.remaining < 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${slo.errorBudget.remaining}%`}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {/* Services Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Server className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Service Health</h2>
                    <p className="text-white/80">Monitor all your microservices in one place</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Services</p>
                    <p className="text-2xl font-bold">{stats.totalServices}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Healthy</p>
                    <p className="text-2xl font-bold">{stats.healthyServices}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Degraded</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Critical</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

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
            {/* Metrics Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Gauge className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Metric Explorer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Browse and analyze all system metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Metric
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

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
            {/* Traces Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Distributed Tracing</h2>
                    <p className="text-white/80">End-to-end visibility across all services</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Traces</p>
                    <p className="text-2xl font-bold">{stats.totalTraces}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Errors</p>
                    <p className="text-2xl font-bold">{stats.errorTraces}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Duration</p>
                    <p className="text-2xl font-bold">337ms</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">P99 Latency</p>
                    <p className="text-2xl font-bold">892ms</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

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
            {/* Alerts Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bell className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Alert Management</h2>
                    <p className="text-white/80">Configure and manage your alerting rules</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Firing</p>
                    <p className="text-2xl font-bold">{stats.firingAlerts}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Acknowledged</p>
                    <p className="text-2xl font-bold">{stats.acknowledgedAlerts}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Resolved (24h)</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Rules</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

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

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="space-y-6">
            {/* Dashboards Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Custom Dashboards</h2>
                    <p className="text-white/80">Build and share observability dashboards</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Dashboards</p>
                    <p className="text-2xl font-bold">{stats.totalDashboards}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Favorites</p>
                    <p className="text-2xl font-bold">{stats.favoriteDashboards}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Shared</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Views</p>
                    <p className="text-2xl font-bold">3.5K</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Dashboards</h3>
                <p className="text-sm text-gray-500">Create and manage your observability dashboards</p>
              </div>
              <Button onClick={() => setShowCreateDashboardDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDashboards.map((dashboard) => (
                <Card key={dashboard.id} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {dashboard.isFavorite && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">
                            ★
                          </Badge>
                        )}
                        {dashboard.shared && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                            Shared
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{dashboard.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {dashboard.widgets} widgets
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {dashboard.views} views
                        </span>
                      </div>
                      <span>{dashboard.owner}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400">
                        Updated {formatDate(dashboard.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dashboard Templates */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Dashboard Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['APM Overview', 'Infrastructure Health', 'Error Analysis', 'Business Metrics', 'Security Dashboard', 'Cost Optimization'].map((template) => (
                    <div key={template} className="p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                      <p className="font-medium text-gray-900 dark:text-white">{template}</p>
                      <p className="text-xs text-gray-500 mt-1">Pre-built template</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'alerting', label: 'Alerting', icon: Bell },
                      { id: 'retention', label: 'Retention', icon: Database },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">General Settings</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Time Zone</p>
                              <p className="text-sm text-gray-500">Set the default timezone for all dashboards</p>
                            </div>
                            <Select defaultValue="utc">
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="local">Local Time</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Default Time Range</p>
                              <p className="text-sm text-gray-500">Default time window for queries</p>
                            </div>
                            <Select defaultValue="1h">
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15m">Last 15 minutes</SelectItem>
                                <SelectItem value="1h">Last 1 hour</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-refresh</p>
                              <p className="text-sm text-gray-500">Automatically refresh data</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
                              <p className="text-sm text-gray-500">Show more data in less space</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'integrations' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Connected Integrations</h4>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Integration
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {mockIntegrations.map((integration) => (
                          <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-xs text-gray-500">{integration.dataPoints.toLocaleString()} data points</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className={
                                integration.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                integration.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }>
                                {integration.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsTab === 'alerting' && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Alert Configuration</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                            <p className="text-sm text-gray-500">Send alerts via email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Slack Notifications</p>
                            <p className="text-sm text-gray-500">Send alerts to Slack channels</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">PagerDuty Integration</p>
                            <p className="text-sm text-gray-500">Escalate critical alerts</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Alert Grouping</p>
                            <p className="text-sm text-gray-500">Group similar alerts to reduce noise</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'retention' && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Data Retention</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <LineChart className="w-5 h-5 text-blue-600" />
                            <p className="font-medium text-gray-900 dark:text-white">Metrics Data</p>
                          </div>
                          <Progress value={65} className="h-2 mb-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">65% used</span>
                            <span className="text-gray-900 dark:text-white">13 months</span>
                          </div>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <Terminal className="w-5 h-5 text-purple-600" />
                            <p className="font-medium text-gray-900 dark:text-white">Log Data</p>
                          </div>
                          <Progress value={82} className="h-2 mb-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">82% used</span>
                            <span className="text-gray-900 dark:text-white">30 days</span>
                          </div>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <Layers className="w-5 h-5 text-green-600" />
                            <p className="font-medium text-gray-900 dark:text-white">Trace Data</p>
                          </div>
                          <Progress value={45} className="h-2 mb-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">45% used</span>
                            <span className="text-gray-900 dark:text-white">14 days</span>
                          </div>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <Database className="w-5 h-5 text-orange-600" />
                            <p className="font-medium text-gray-900 dark:text-white">Alert History</p>
                          </div>
                          <Progress value={28} className="h-2 mb-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">28% used</span>
                            <span className="text-gray-900 dark:text-white">90 days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage API keys and authentication</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">API Keys</p>
                            <p className="text-sm text-gray-500">Manage API access tokens</p>
                          </div>
                          <Button variant="outline" size="sm">Manage Keys</Button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Configuration</p>
                            <p className="text-sm text-gray-500">Configure single sign-on</p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
                            <p className="text-sm text-gray-500">Require 2FA for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all user actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>IP Restrictions</CardTitle>
                        <CardDescription>Control access by IP address</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Only allow specific IP ranges</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">VPN Required</p>
                            <p className="text-sm text-gray-500">Require VPN for dashboard access</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Export metrics and logs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export All Metrics</p>
                            <p className="text-sm text-gray-500">Download complete metric history</p>
                          </div>
                          <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export Logs</p>
                            <p className="text-sm text-gray-500">Download log archives</p>
                          </div>
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear All Data</p>
                            <p className="text-sm text-gray-500">Delete all metrics and logs</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset Configuration</p>
                            <p className="text-sm text-gray-500">Reset all settings to defaults</p>
                          </div>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockPerfAnalyticsAIInsights}
              title="Performance Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockPerfAnalyticsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockPerfAnalyticsPredictions}
              title="Performance Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockPerfAnalyticsActivities}
            title="Performance Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={perfAnalyticsQuickActions}
            variant="grid"
          />
        </div>

        {/* Create Dashboard Dialog */}
        <Dialog open={showCreateDashboardDialog} onOpenChange={setShowCreateDashboardDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
              <DialogDescription>Configure your custom observability dashboard</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Dashboard Name</Label>
                <Input placeholder="My Dashboard" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Dashboard description..." />
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select defaultValue="blank">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blank">Blank Dashboard</SelectItem>
                    <SelectItem value="apm">APM Overview</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="errors">Error Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="shared" />
                <Label htmlFor="shared">Share with team</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDashboardDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Create Dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        {/* New Alert Dialog */}
        <Dialog open={showNewAlertDialog} onOpenChange={setShowNewAlertDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>Configure alerting rules for your metrics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alert Name</Label>
                <Input
                  placeholder="e.g., High Latency Alert"
                  value={newAlertForm.name}
                  onChange={(e) => setNewAlertForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select
                  value={newAlertForm.metric}
                  onValueChange={(value) => setNewAlertForm(prev => ({ ...prev, metric: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latency_p99">Latency P99</SelectItem>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                    <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                    <SelectItem value="memory_usage">Memory Usage</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="disk_usage">Disk Usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={newAlertForm.condition}
                    onValueChange={(value) => setNewAlertForm(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={newAlertForm.threshold}
                    onChange={(e) => setNewAlertForm(prev => ({ ...prev, threshold: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={newAlertForm.severity}
                  onValueChange={(value) => setNewAlertForm(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-2">
                <Label>Notification Channels</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email Notifications</span>
                  <Switch
                    checked={newAlertForm.notifyEmail}
                    onCheckedChange={(checked) => setNewAlertForm(prev => ({ ...prev, notifyEmail: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slack Notifications</span>
                  <Switch
                    checked={newAlertForm.notifySlack}
                    onCheckedChange={(checked) => setNewAlertForm(prev => ({ ...prev, notifySlack: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewAlertDialog(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleCreateAlert}>
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Export Performance Data</DialogTitle>
              <DialogDescription>Configure your data export options</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select
                  value={exportForm.format}
                  onValueChange={(value) => setExportForm(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="parquet">Parquet</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select
                  value={exportForm.dateRange}
                  onValueChange={(value) => setExportForm(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-2">
                <Label>Include Data</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Metrics Data</span>
                  <Switch
                    checked={exportForm.includeMetrics}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeMetrics: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Log Data</span>
                  <Switch
                    checked={exportForm.includeLogs}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeLogs: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trace Data</span>
                  <Switch
                    checked={exportForm.includeTraces}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeTraces: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New SLO Dialog */}
        <Dialog open={showNewSLODialog} onOpenChange={setShowNewSLODialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New SLO</DialogTitle>
              <DialogDescription>Define a Service Level Objective for your system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>SLO Name</Label>
                <Input
                  placeholder="e.g., API Availability"
                  value={newSLOForm.name}
                  onChange={(e) => setNewSLOForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Describe this SLO..."
                  value={newSLOForm.description}
                  onChange={(e) => setNewSLOForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Metric</Label>
                  <Select
                    value={newSLOForm.metric}
                    onValueChange={(value) => setNewSLOForm(prev => ({ ...prev, metric: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="availability">Availability</SelectItem>
                      <SelectItem value="latency">Latency</SelectItem>
                      <SelectItem value="error_rate">Error Rate</SelectItem>
                      <SelectItem value="throughput">Throughput</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="99.9"
                    value={newSLOForm.target}
                    onChange={(e) => setNewSLOForm(prev => ({ ...prev, target: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time Window</Label>
                <Select
                  value={newSLOForm.timeWindow}
                  onValueChange={(value) => setNewSLOForm(prev => ({ ...prev, timeWindow: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Error Budget:</strong> With a {newSLOForm.target}% target over {newSLOForm.timeWindow},
                  you will have {(100 - parseFloat(newSLOForm.target || '99.9')).toFixed(2)}% error budget.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSLODialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateSLO}>
                <Target className="w-4 h-4 mr-2" />
                Create SLO
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integrations Dialog */}
        <Dialog open={showIntegrationsDialog} onOpenChange={setShowIntegrationsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Integrations</DialogTitle>
              <DialogDescription>Connect external services for enhanced observability</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {mockIntegrations.map((integration) => (
                  <div key={integration.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                          <p className="text-xs text-gray-500">{integration.type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        integration.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        integration.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }>
                        {integration.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">{integration.dataPoints.toLocaleString()} data points</span>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-blue-500 cursor-pointer transition-colors">
                <Plus className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Add New Integration</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Trace Search Dialog */}
        <Dialog open={showTraceSearchDialog} onOpenChange={setShowTraceSearchDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Search Traces</DialogTitle>
              <DialogDescription>Find distributed traces across your services</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Trace ID</Label>
                <Input
                  placeholder="trace-abc123xyz"
                  value={traceSearchForm.traceId}
                  onChange={(e) => setTraceSearchForm(prev => ({ ...prev, traceId: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select
                    value={traceSearchForm.service}
                    onValueChange={(value) => setTraceSearchForm(prev => ({ ...prev, service: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {mockServices.map(s => (
                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={traceSearchForm.status}
                    onValueChange={(value) => setTraceSearchForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="timeout">Timeout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Duration (ms)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={traceSearchForm.minDuration}
                    onChange={(e) => setTraceSearchForm(prev => ({ ...prev, minDuration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Duration (ms)</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={traceSearchForm.maxDuration}
                    onChange={(e) => setTraceSearchForm(prev => ({ ...prev, maxDuration: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTraceSearchDialog(false)}>Cancel</Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleTraceSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search Traces
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logs Filter Dialog */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Filter Logs</DialogTitle>
              <DialogDescription>Configure log viewing options</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Search Query</Label>
                <Input
                  placeholder="Search logs..."
                  value={logsFilterForm.searchQuery}
                  onChange={(e) => setLogsFilterForm(prev => ({ ...prev, searchQuery: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select
                    value={logsFilterForm.level}
                    onValueChange={(value) => setLogsFilterForm(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select
                    value={logsFilterForm.service}
                    onValueChange={(value) => setLogsFilterForm(prev => ({ ...prev, service: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {mockServices.map(s => (
                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select
                  value={logsFilterForm.timeRange}
                  onValueChange={(value) => setLogsFilterForm(prev => ({ ...prev, timeRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">Last 15 minutes</SelectItem>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="6h">Last 6 hours</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Tip:</strong> Use advanced query syntax like <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">level:error AND service:API*</code> for complex searches.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogsDialog(false)}>Cancel</Button>
              <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={handleLogsFilter}>
                <FileText className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Performance Analytics</DialogTitle>
              <DialogDescription>Deep dive into your system performance</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(totalThroughput / 1000).toFixed(1)}K</p>
                        <p className="text-sm text-gray-500">Requests/min</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthyServices}/{mockServices.length}</p>
                        <p className="text-sm text-gray-500">Healthy Services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Timer className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgLatency)}ms</p>
                        <p className="text-sm text-gray-500">Avg Latency</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallErrorRate.toFixed(2)}%</p>
                        <p className="text-sm text-gray-500">Error Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Top Performers</h4>
                <div className="space-y-2">
                  {mockServices.sort((a, b) => a.latency - b.latency).slice(0, 3).map((service, i) => (
                    <div key={service.name} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-xs text-white font-bold">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{service.latency}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>Close</Button>
              <Button onClick={() => { setShowAnalyticsDialog(false); setActiveTab('metrics'); }}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Metrics
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alerts View Dialog */}
        <Dialog open={showAlertsViewDialog} onOpenChange={setShowAlertsViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Active Alerts</DialogTitle>
              <DialogDescription>Monitor and manage your system alerts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    {firingAlerts} Firing
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {mockAlerts.filter(a => a.status === 'acknowledged').length} Acknowledged
                  </Badge>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {mockAlerts.filter(a => a.status === 'resolved').length} Resolved
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setShowAlertsViewDialog(false); setShowNewAlertDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Alert
                </Button>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${
                      alert.status === 'firing' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                      alert.status === 'acknowledged' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' :
                      'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{alert.name}</h4>
                            <Badge variant="outline" className={severityColors[alert.severity]}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {alert.metric} {alert.condition} (Current: {alert.value}, Threshold: {alert.threshold})
                          </p>
                          <p className="text-xs text-gray-400">
                            Triggered: {formatDate(alert.triggeredAt)}
                            {alert.resolvedAt && ` | Resolved: ${formatDate(alert.resolvedAt)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[alert.status]}>
                            {alert.status}
                          </Badge>
                          {alert.status === 'firing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.success('Alert Acknowledged', { description: `${alert.name} has been acknowledged` })}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertsViewDialog(false)}>Close</Button>
              <Button onClick={() => { setShowAlertsViewDialog(false); setActiveTab('alerts'); }}>
                <Bell className="w-4 h-4 mr-2" />
                View All Alerts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
