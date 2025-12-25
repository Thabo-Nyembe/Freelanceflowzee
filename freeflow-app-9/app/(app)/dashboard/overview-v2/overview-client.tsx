'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Users, DollarSign, Activity,
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Clock, Zap, Server,
  Database, Globe, Cpu, HardDrive, Wifi, RefreshCw, Settings, Bell, Plus,
  Search, Filter, Calendar, ChevronRight, MoreHorizontal, Eye, Download,
  Share2, Star, ArrowUpRight, ArrowDownRight, BarChart3, LineChart, PieChart,
  Target, Layers, Box, GitBranch, Cloud, Shield, Lock, Play, Pause,
  ExternalLink, Copy, Maximize2, Grid, List, MapPin, Gauge, Terminal,
  FileText, Hash, Network, Radio, Thermometer, Droplets, Wind, Timer,
  CircleDot, Sparkles, Rocket, TrendingUp as TrendUp
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS - Datadog Level Monitoring
// ============================================================================

type MetricStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'no_data'
type TimeRange = '1h' | '4h' | '24h' | '7d' | '30d' | 'custom'
type AlertSeverity = 'critical' | 'warning' | 'info' | 'low'
type AlertStatus = 'triggered' | 'acknowledged' | 'resolved' | 'muted'
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown'
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

interface Metric {
  id: string
  name: string
  display_name: string
  value: number
  unit: string
  change: number
  change_percent: number
  status: MetricStatus
  sparkline: number[]
  tags: string[]
  host: string
  last_updated: string
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
  interval_seconds: number
}

interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  service: string
  metric: string
  threshold: number
  current_value: number
  triggered_at: string
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  muted_until: string | null
  tags: string[]
  related_alerts: string[]
  runbook_url: string | null
  notification_channels: string[]
}

interface Service {
  id: string
  name: string
  display_name: string
  status: ServiceStatus
  uptime_percent: number
  response_time_p50: number
  response_time_p95: number
  response_time_p99: number
  error_rate: number
  throughput: number
  region: string
  environment: 'production' | 'staging' | 'development'
  last_incident_at: string | null
  dependencies: string[]
  health_checks: HealthCheck[]
  apm_enabled: boolean
  version: string
}

interface HealthCheck {
  id: string
  name: string
  type: 'http' | 'tcp' | 'dns' | 'ssl' | 'process'
  status: 'passing' | 'failing' | 'warning'
  last_check_at: string
  response_time_ms: number
  details: string
}

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  host: string
  message: string
  attributes: Record<string, unknown>
  trace_id: string | null
  span_id: string | null
  tags: string[]
}

interface Dashboard {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  tags: string[]
  created_by: string
  created_at: string
  updated_at: string
  is_favorite: boolean
  is_shared: boolean
}

interface DashboardWidget {
  id: string
  type: 'timeseries' | 'query_value' | 'toplist' | 'heatmap' | 'distribution' | 'table' | 'note' | 'slo'
  title: string
  query: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: { x: number; y: number; w: number; h: number }
  visualization: Record<string, unknown>
}

interface Monitor {
  id: string
  name: string
  type: 'metric' | 'log' | 'apm' | 'synthetics' | 'composite'
  query: string
  message: string
  priority: 1 | 2 | 3 | 4 | 5
  tags: string[]
  status: 'ok' | 'alert' | 'warn' | 'no_data'
  last_triggered_at: string | null
  created_by: string
  created_at: string
}

interface SLO {
  id: string
  name: string
  description: string
  target_percent: number
  current_percent: number
  time_window: '7d' | '30d' | '90d'
  type: 'metric' | 'monitor'
  status: 'ok' | 'warning' | 'breached'
  error_budget_remaining: number
  burn_rate: number
}

interface InfraHost {
  id: string
  name: string
  hostname: string
  os: string
  ip_address: string
  cpu_percent: number
  memory_percent: number
  disk_percent: number
  network_in_mbps: number
  network_out_mbps: number
  status: 'running' | 'stopped' | 'pending' | 'unknown'
  agent_version: string
  last_seen_at: string
  tags: string[]
  cloud_provider: 'aws' | 'gcp' | 'azure' | 'on-prem'
  instance_type: string
}

// ============================================================================
// MOCK DATA - Datadog Level
// ============================================================================

const mockMetrics: Metric[] = [
  { id: 'm1', name: 'system.revenue.total', display_name: 'Total Revenue', value: 284500, unit: 'USD', change: 12500, change_percent: 4.6, status: 'healthy', sparkline: [65, 72, 68, 75, 82, 78, 85, 90, 88, 92, 95, 98], tags: ['env:production', 'team:finance'], host: 'app-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'sum', interval_seconds: 60 },
  { id: 'm2', name: 'app.users.active', display_name: 'Active Users', value: 12847, unit: '', change: 847, change_percent: 7.1, status: 'healthy', sparkline: [100, 105, 110, 108, 115, 120, 118, 125, 130, 128, 135, 140], tags: ['env:production', 'team:product'], host: 'app-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 60 },
  { id: 'm3', name: 'api.requests.rate', display_name: 'API Requests/min', value: 45200, unit: 'rpm', change: -2100, change_percent: -4.4, status: 'warning', sparkline: [50, 52, 48, 55, 53, 51, 49, 47, 45, 46, 44, 45], tags: ['env:production', 'service:api-gateway'], host: 'api-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 10 },
  { id: 'm4', name: 'api.errors.rate', display_name: 'Error Rate', value: 0.12, unit: '%', change: -0.03, change_percent: -20, status: 'healthy', sparkline: [0.2, 0.18, 0.15, 0.14, 0.13, 0.12, 0.11, 0.12, 0.11, 0.12, 0.12, 0.12], tags: ['env:production', 'service:api-gateway'], host: 'api-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 60 },
  { id: 'm5', name: 'api.latency.p95', display_name: 'P95 Latency', value: 145, unit: 'ms', change: 12, change_percent: 9, status: 'warning', sparkline: [120, 125, 130, 128, 135, 140, 138, 142, 145, 143, 146, 145], tags: ['env:production', 'service:api-gateway'], host: 'api-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 60 },
  { id: 'm6', name: 'system.cpu.percent', display_name: 'CPU Usage', value: 67, unit: '%', change: 5, change_percent: 8.1, status: 'healthy', sparkline: [55, 58, 62, 60, 65, 63, 68, 66, 70, 68, 67, 67], tags: ['env:production', 'host:app-server-1'], host: 'app-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 10 },
  { id: 'm7', name: 'system.memory.percent', display_name: 'Memory Usage', value: 72, unit: '%', change: 3, change_percent: 4.3, status: 'healthy', sparkline: [65, 66, 68, 67, 69, 70, 71, 70, 72, 71, 72, 72], tags: ['env:production', 'host:app-server-1'], host: 'app-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 10 },
  { id: 'm8', name: 'system.disk.percent', display_name: 'Disk Usage', value: 45, unit: '%', change: 2, change_percent: 4.6, status: 'healthy', sparkline: [40, 41, 42, 42, 43, 43, 44, 44, 45, 45, 45, 45], tags: ['env:production', 'host:app-server-1'], host: 'app-server-1', last_updated: '2024-01-15T14:30:00Z', aggregation: 'avg', interval_seconds: 300 }
]

const mockAlerts: Alert[] = [
  { id: 'a1', title: 'High Response Time', message: 'API response time exceeded threshold of 200ms', severity: 'warning', status: 'triggered', source: 'monitor', service: 'API Gateway', metric: 'api.latency.p95', threshold: 200, current_value: 245, triggered_at: '2024-01-15T14:25:00Z', acknowledged_by: null, acknowledged_at: null, resolved_at: null, muted_until: null, tags: ['env:production', 'team:platform'], related_alerts: [], runbook_url: 'https://runbook.example.com/high-latency', notification_channels: ['#platform-alerts', 'pagerduty'] },
  { id: 'a2', title: 'Database Connection Pool', message: 'Connection pool utilization at 85%', severity: 'warning', status: 'acknowledged', source: 'monitor', service: 'PostgreSQL', metric: 'db.connection_pool.usage', threshold: 80, current_value: 85, triggered_at: '2024-01-15T14:20:00Z', acknowledged_by: 'john.doe', acknowledged_at: '2024-01-15T14:22:00Z', resolved_at: null, muted_until: null, tags: ['env:production', 'team:database'], related_alerts: [], runbook_url: null, notification_channels: ['#db-alerts'] },
  { id: 'a3', title: 'SSL Certificate Expiring', message: 'Certificate expires in 14 days', severity: 'info', status: 'triggered', source: 'synthetics', service: 'CDN', metric: 'ssl.days_remaining', threshold: 30, current_value: 14, triggered_at: '2024-01-15T10:00:00Z', acknowledged_by: null, acknowledged_at: null, resolved_at: null, muted_until: null, tags: ['env:production', 'team:security'], related_alerts: [], runbook_url: 'https://runbook.example.com/ssl-renewal', notification_channels: ['#security'] },
  { id: 'a4', title: 'Memory Usage Critical', message: 'Memory usage exceeded 90% threshold', severity: 'critical', status: 'triggered', source: 'monitor', service: 'Worker Nodes', metric: 'system.memory.percent', threshold: 90, current_value: 92, triggered_at: '2024-01-15T14:28:00Z', acknowledged_by: null, acknowledged_at: null, resolved_at: null, muted_until: null, tags: ['env:production', 'team:infrastructure'], related_alerts: ['a2'], runbook_url: 'https://runbook.example.com/high-memory', notification_channels: ['#infra-alerts', 'pagerduty'] },
  { id: 'a5', title: 'Deployment Failed', message: 'CI/CD pipeline deployment failed for service api-gateway', severity: 'critical', status: 'resolved', source: 'ci-cd', service: 'API Gateway', metric: 'deployment.status', threshold: 1, current_value: 0, triggered_at: '2024-01-15T12:00:00Z', acknowledged_by: 'jane.smith', acknowledged_at: '2024-01-15T12:05:00Z', resolved_at: '2024-01-15T12:30:00Z', muted_until: null, tags: ['env:production', 'team:platform'], related_alerts: [], runbook_url: null, notification_channels: ['#deployments'] }
]

const mockServices: Service[] = [
  { id: 's1', name: 'api-gateway', display_name: 'API Gateway', status: 'operational', uptime_percent: 99.98, response_time_p50: 25, response_time_p95: 145, response_time_p99: 320, error_rate: 0.02, throughput: 12500, region: 'us-east-1', environment: 'production', last_incident_at: '2024-01-10T08:00:00Z', dependencies: ['auth-service', 'database'], health_checks: [{ id: 'hc1', name: 'HTTP Health', type: 'http', status: 'passing', last_check_at: '2024-01-15T14:30:00Z', response_time_ms: 23, details: 'HTTP 200 OK' }], apm_enabled: true, version: '2.5.1' },
  { id: 's2', name: 'auth-service', display_name: 'Auth Service', status: 'operational', uptime_percent: 99.99, response_time_p50: 15, response_time_p95: 45, response_time_p99: 120, error_rate: 0.01, throughput: 8400, region: 'us-east-1', environment: 'production', last_incident_at: null, dependencies: ['database', 'redis'], health_checks: [{ id: 'hc2', name: 'HTTP Health', type: 'http', status: 'passing', last_check_at: '2024-01-15T14:30:00Z', response_time_ms: 12, details: 'HTTP 200 OK' }], apm_enabled: true, version: '1.8.0' },
  { id: 's3', name: 'database', display_name: 'PostgreSQL', status: 'operational', uptime_percent: 99.95, response_time_p50: 5, response_time_p95: 25, response_time_p99: 80, error_rate: 0.00, throughput: 25000, region: 'us-east-1', environment: 'production', last_incident_at: '2024-01-05T14:00:00Z', dependencies: [], health_checks: [{ id: 'hc3', name: 'TCP Check', type: 'tcp', status: 'passing', last_check_at: '2024-01-15T14:30:00Z', response_time_ms: 2, details: 'Port 5432 accepting connections' }], apm_enabled: false, version: '15.4' },
  { id: 's4', name: 'worker-nodes', display_name: 'Worker Nodes', status: 'degraded', uptime_percent: 99.85, response_time_p50: 100, response_time_p95: 450, response_time_p99: 1200, error_rate: 0.15, throughput: 5200, region: 'us-east-1', environment: 'production', last_incident_at: '2024-01-15T14:28:00Z', dependencies: ['database', 'redis', 'queue'], health_checks: [{ id: 'hc4', name: 'Process Check', type: 'process', status: 'warning', last_check_at: '2024-01-15T14:30:00Z', response_time_ms: 0, details: 'High memory usage detected' }], apm_enabled: true, version: '3.2.0' },
  { id: 's5', name: 'cdn', display_name: 'CDN', status: 'operational', uptime_percent: 99.99, response_time_p50: 5, response_time_p95: 15, response_time_p99: 35, error_rate: 0.00, throughput: 85000, region: 'global', environment: 'production', last_incident_at: null, dependencies: [], health_checks: [{ id: 'hc5', name: 'SSL Check', type: 'ssl', status: 'warning', last_check_at: '2024-01-15T14:30:00Z', response_time_ms: 50, details: 'Certificate expires in 14 days' }], apm_enabled: false, version: 'N/A' },
  { id: 's6', name: 'redis', display_name: 'Redis Cache', status: 'operational', uptime_percent: 99.97, response_time_p50: 1, response_time_p95: 3, response_time_p99: 8, error_rate: 0.00, throughput: 150000, region: 'us-east-1', environment: 'production', last_incident_at: null, dependencies: [], health_checks: [{ id: 'hc6', name: 'TCP Check', type: 'tcp', status: 'passing', last_check_at: '2024-01-15T14:30:00Z', response_time_ms: 1, details: 'Port 6379 accepting connections' }], apm_enabled: false, version: '7.2.3' }
]

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2024-01-15T14:30:45Z', level: 'error', service: 'api-gateway', host: 'api-server-1', message: 'Connection timeout to database after 30s', attributes: { error_code: 'ETIMEDOUT', retry_count: 3 }, trace_id: 'abc123', span_id: 'def456', tags: ['env:production'] },
  { id: 'l2', timestamp: '2024-01-15T14:30:30Z', level: 'warn', service: 'worker-nodes', host: 'worker-1', message: 'High memory usage detected: 92%', attributes: { memory_used_mb: 7500, memory_total_mb: 8192 }, trace_id: null, span_id: null, tags: ['env:production'] },
  { id: 'l3', timestamp: '2024-01-15T14:30:15Z', level: 'info', service: 'auth-service', host: 'auth-server-1', message: 'User authentication successful', attributes: { user_id: 'user_123', method: 'oauth2' }, trace_id: 'ghi789', span_id: 'jkl012', tags: ['env:production'] },
  { id: 'l4', timestamp: '2024-01-15T14:30:00Z', level: 'debug', service: 'api-gateway', host: 'api-server-1', message: 'Request received: GET /api/v1/users', attributes: { method: 'GET', path: '/api/v1/users', user_agent: 'Mozilla/5.0' }, trace_id: 'mno345', span_id: 'pqr678', tags: ['env:production'] },
  { id: 'l5', timestamp: '2024-01-15T14:29:45Z', level: 'info', service: 'database', host: 'db-primary', message: 'Query executed in 12ms', attributes: { query_type: 'SELECT', rows_affected: 150 }, trace_id: null, span_id: null, tags: ['env:production'] },
  { id: 'l6', timestamp: '2024-01-15T14:29:30Z', level: 'error', service: 'worker-nodes', host: 'worker-2', message: 'Job processing failed: OutOfMemoryError', attributes: { job_id: 'job_456', job_type: 'data_export' }, trace_id: 'stu901', span_id: 'vwx234', tags: ['env:production'] }
]

const mockHosts: InfraHost[] = [
  { id: 'h1', name: 'app-server-1', hostname: 'ip-10-0-1-10.ec2.internal', os: 'Ubuntu 22.04', ip_address: '10.0.1.10', cpu_percent: 67, memory_percent: 72, disk_percent: 45, network_in_mbps: 125, network_out_mbps: 85, status: 'running', agent_version: '7.50.0', last_seen_at: '2024-01-15T14:30:00Z', tags: ['env:production', 'role:app'], cloud_provider: 'aws', instance_type: 't3.xlarge' },
  { id: 'h2', name: 'api-server-1', hostname: 'ip-10-0-1-20.ec2.internal', os: 'Ubuntu 22.04', ip_address: '10.0.1.20', cpu_percent: 45, memory_percent: 58, disk_percent: 38, network_in_mbps: 250, network_out_mbps: 180, status: 'running', agent_version: '7.50.0', last_seen_at: '2024-01-15T14:30:00Z', tags: ['env:production', 'role:api'], cloud_provider: 'aws', instance_type: 't3.2xlarge' },
  { id: 'h3', name: 'worker-1', hostname: 'ip-10-0-2-10.ec2.internal', os: 'Ubuntu 22.04', ip_address: '10.0.2.10', cpu_percent: 85, memory_percent: 92, disk_percent: 55, network_in_mbps: 50, network_out_mbps: 30, status: 'running', agent_version: '7.50.0', last_seen_at: '2024-01-15T14:30:00Z', tags: ['env:production', 'role:worker'], cloud_provider: 'aws', instance_type: 'r5.xlarge' },
  { id: 'h4', name: 'db-primary', hostname: 'ip-10-0-3-10.ec2.internal', os: 'Ubuntu 22.04', ip_address: '10.0.3.10', cpu_percent: 35, memory_percent: 65, disk_percent: 72, network_in_mbps: 180, network_out_mbps: 220, status: 'running', agent_version: '7.50.0', last_seen_at: '2024-01-15T14:30:00Z', tags: ['env:production', 'role:database'], cloud_provider: 'aws', instance_type: 'r5.2xlarge' }
]

const mockSLOs: SLO[] = [
  { id: 'slo1', name: 'API Availability', description: 'API should be available 99.9% of the time', target_percent: 99.9, current_percent: 99.95, time_window: '30d', type: 'monitor', status: 'ok', error_budget_remaining: 85, burn_rate: 0.5 },
  { id: 'slo2', name: 'API Latency P95', description: 'P95 latency should be under 200ms', target_percent: 95, current_percent: 92.5, time_window: '7d', type: 'metric', status: 'warning', error_budget_remaining: 25, burn_rate: 2.5 },
  { id: 'slo3', name: 'Error Rate', description: 'Error rate should be under 0.1%', target_percent: 99.9, current_percent: 99.88, time_window: '30d', type: 'metric', status: 'ok', error_budget_remaining: 78, burn_rate: 0.8 }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: MetricStatus | ServiceStatus): string => {
  const colors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    operational: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    outage: 'bg-red-100 text-red-800 border-red-200',
    maintenance: 'bg-blue-100 text-blue-800 border-blue-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200',
    no_data: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[status] || colors.unknown
}

const getSeverityColor = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[severity]
}

const getLogLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    error: 'bg-red-100 text-red-800',
    warn: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    debug: 'bg-gray-100 text-gray-800',
    trace: 'bg-purple-100 text-purple-800'
  }
  return colors[level]
}

const formatValue = (value: number, unit: string): string => {
  if (unit === 'USD') return `$${value.toLocaleString()}`
  if (unit === '%') return `${value.toFixed(value < 1 ? 2 : 0)}%`
  if (unit === 'ms') return `${value}ms`
  if (unit === 'rpm') return `${(value / 1000).toFixed(1)}K/min`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString()
}

const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const then = new Date(date)
  const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OverviewClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' }
  ]

  // Dashboard stats
  const stats = useMemo(() => ({
    healthyServices: mockServices.filter(s => s.status === 'operational').length,
    totalServices: mockServices.length,
    criticalAlerts: mockAlerts.filter(a => a.severity === 'critical' && a.status === 'triggered').length,
    warningAlerts: mockAlerts.filter(a => a.severity === 'warning' && a.status === 'triggered').length,
    overallUptime: (mockServices.reduce((sum, s) => sum + s.uptime_percent, 0) / mockServices.length).toFixed(2),
    totalHosts: mockHosts.length,
    activeHosts: mockHosts.filter(h => h.status === 'running').length,
    avgCpu: Math.round(mockHosts.reduce((sum, h) => sum + h.cpu_percent, 0) / mockHosts.length)
  }), [])

  // Filtered data
  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log =>
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-indigo-200 mt-1">Datadog-level monitoring & observability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRefresh}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Services', value: `${stats.healthyServices}/${stats.totalServices}`, icon: Server, color: 'from-green-500 to-emerald-500', change: 'All healthy' },
            { label: 'Uptime', value: `${stats.overallUptime}%`, icon: Activity, color: 'from-blue-500 to-cyan-500', change: '30 days' },
            { label: 'Critical', value: stats.criticalAlerts.toString(), icon: AlertTriangle, color: 'from-red-500 to-pink-500', change: 'Active' },
            { label: 'Warnings', value: stats.warningAlerts.toString(), icon: AlertCircle, color: 'from-yellow-500 to-orange-500', change: 'Active' },
            { label: 'Hosts', value: `${stats.activeHosts}/${stats.totalHosts}`, icon: Cpu, color: 'from-purple-500 to-indigo-500', change: 'Running' },
            { label: 'Avg CPU', value: `${stats.avgCpu}%`, icon: Gauge, color: 'from-teal-500 to-green-500', change: 'All hosts' },
            { label: 'Requests', value: formatValue(45200, 'rpm'), icon: Zap, color: 'from-orange-500 to-red-500', change: '/min' },
            { label: 'Latency P95', value: '145ms', icon: Timer, color: 'from-pink-500 to-rose-500', change: 'API' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics" className="rounded-lg">Metrics</TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">
              Alerts
              {stats.criticalAlerts > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">{stats.criticalAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg">Logs</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockMetrics.slice(0, 8).map(metric => (
                <Card key={metric.id} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 truncate">{metric.display_name}</span>
                      <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {metric.change_percent > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change_percent > 0 ? '+' : ''}{metric.change_percent}%
                      </span>
                    </div>
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

            {/* Services & SLOs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-600" />
                    Service Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockServices.map(service => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'operational' ? 'bg-green-500' :
                            service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{service.display_name}</p>
                            <p className="text-xs text-gray-500">{service.region} · {service.environment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{service.uptime_percent}%</p>
                            <p className="text-xs text-gray-500">Uptime</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{service.response_time_p95}ms</p>
                            <p className="text-xs text-gray-500">P95</p>
                          </div>
                          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    SLOs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSLOs.map(slo => (
                      <div key={slo.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{slo.name}</span>
                          <Badge className={slo.status === 'ok' ? 'bg-green-100 text-green-800' : slo.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {slo.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">Current: {slo.current_percent}%</span>
                          <span className="text-gray-500">Target: {slo.target_percent}%</span>
                        </div>
                        <Progress value={(slo.current_percent / slo.target_percent) * 100} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2">Error budget: {slo.error_budget_remaining}% remaining</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAlerts.slice(0, 4).map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {alert.severity === 'critical' ? <XCircle className="w-5 h-5" /> :
                           alert.severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                           <AlertCircle className="w-5 h-5" />}
                          <div>
                            <p className="font-semibold">{alert.title}</p>
                            <p className="text-sm opacity-80">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{alert.status}</Badge>
                          <span className="text-xs opacity-70">{formatTimeAgo(alert.triggered_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMetrics.map(metric => (
                <Card key={metric.id} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{metric.display_name}</h4>
                      <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {metric.change_percent > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={metric.change_percent > 0 ? 'text-green-600' : 'text-red-600'}>
                          {metric.change_percent > 0 ? '+' : ''}{metric.change_percent}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(metric.last_updated)}</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-12 mb-4">
                      {metric.sparkline.map((value, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t"
                          style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {metric.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6 mt-6">
            <div className="space-y-4">
              {mockServices.map(service => (
                <Card
                  key={service.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{service.display_name}</h4>
                          <p className="text-sm text-gray-500">{service.region} · {service.environment} · v{service.version}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Uptime</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.uptime_percent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">P50 Latency</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.response_time_p50}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-500">P95 Latency</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.response_time_p95}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Error Rate</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.error_rate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Throughput</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.throughput.toLocaleString()}/min</p>
                      </div>
                    </div>
                    {service.dependencies.length > 0 && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Dependencies</p>
                        <div className="flex gap-2">
                          {service.dependencies.map(dep => (
                            <Badge key={dep} variant="outline">{dep}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`border-0 shadow-sm cursor-pointer transition-all ${getSeverityColor(alert.severity)}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {alert.severity === 'critical' ? <XCircle className="w-5 h-5" /> :
                         alert.severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                         <AlertCircle className="w-5 h-5" />}
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm opacity-80">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{alert.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>Service: {alert.service}</span>
                        <span>Metric: {alert.metric}</span>
                        <span>Current: {alert.current_value} (threshold: {alert.threshold})</span>
                      </div>
                      <span className="text-xs opacity-70">{formatTimeAgo(alert.triggered_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Live Tail
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="font-mono text-sm">
                    {filteredLogs.map(log => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                        <Badge className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                        <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">{log.service}</span>
                        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.host}</span>
                        <span className="text-gray-900 dark:text-white flex-1 truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive alerts via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Slack Notifications</p>
                      <p className="text-sm text-gray-500">Send alerts to Slack channels</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">PagerDuty Integration</p>
                      <p className="text-sm text-gray-500">Route critical alerts to PagerDuty</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    Dashboard Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto-refresh</p>
                      <p className="text-sm text-gray-500">Refresh data automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">High Contrast Mode</p>
                      <p className="text-sm text-gray-500">Enhanced visibility for metrics</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Compact View</p>
                      <p className="text-sm text-gray-500">Show more data on screen</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Alert Details</DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4 p-4">
                <div className={`p-4 rounded-xl ${getSeverityColor(selectedAlert.severity)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedAlert.severity === 'critical' ? <XCircle className="w-6 h-6" /> :
                     selectedAlert.severity === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                     <AlertCircle className="w-6 h-6" />}
                    <h3 className="text-lg font-bold">{selectedAlert.title}</h3>
                  </div>
                  <p>{selectedAlert.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-semibold">{selectedAlert.service}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Metric</p>
                    <p className="font-semibold">{selectedAlert.metric}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Threshold</p>
                    <p className="font-semibold">{selectedAlert.threshold}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Current Value</p>
                    <p className="font-semibold">{selectedAlert.current_value}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Runbook
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Service Details</DialogTitle>
            </DialogHeader>
            {selectedService && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getStatusColor(selectedService.status)}`}>
                      <Server className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedService.display_name}</h3>
                      <p className="text-gray-500">{selectedService.region} · {selectedService.environment} · v{selectedService.version}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-2xl font-bold">{selectedService.uptime_percent}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Error Rate</p>
                      <p className="text-2xl font-bold">{selectedService.error_rate}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Throughput</p>
                      <p className="text-2xl font-bold">{selectedService.throughput.toLocaleString()}/min</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Latency Distribution</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">P50</p>
                        <p className="font-semibold">{selectedService.response_time_p50}ms</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">P95</p>
                        <p className="font-semibold">{selectedService.response_time_p95}ms</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">P99</p>
                        <p className="font-semibold">{selectedService.response_time_p99}ms</p>
                      </div>
                    </div>
                  </div>

                  {selectedService.health_checks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Health Checks</p>
                      <div className="space-y-2">
                        {selectedService.health_checks.map(check => (
                          <div key={check.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                check.status === 'passing' ? 'bg-green-500' :
                                check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="font-medium">{check.name}</p>
                                <p className="text-xs text-gray-500">{check.details}</p>
                              </div>
                            </div>
                            <Badge className={check.status === 'passing' ? 'bg-green-100 text-green-800' : check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                              {check.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Entry</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 p-4 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={getLogLevelColor(selectedLog.level)}>{selectedLog.level.toUpperCase()}</Badge>
                  <span className="text-gray-500">{formatDate(selectedLog.timestamp)}</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 text-gray-100">
                  <p>{selectedLog.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-semibold">{selectedLog.service}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Host</p>
                    <p className="font-semibold">{selectedLog.host}</p>
                  </div>
                </div>

                {selectedLog.trace_id && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Trace ID</p>
                    <code className="text-sm">{selectedLog.trace_id}</code>
                  </div>
                )}

                {Object.keys(selectedLog.attributes).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Attributes</p>
                    <div className="p-3 rounded-xl bg-gray-900 text-gray-100">
                      <pre className="text-xs">{JSON.stringify(selectedLog.attributes, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
