'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Activity,
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Zap, Server, Globe, Cpu, RefreshCw, Settings, Bell, Plus,
  Search, Filter, MoreHorizontal, Download, ArrowUpRight, ArrowDownRight, BarChart3,
  Target, Cloud, Play,
  ExternalLink, Copy, Gauge, Timer, Webhook, Sliders, AlertOctagon, Trash2, Edit3, Mail,
  Loader2
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import {
  PlatformStatsWidget,
  BusinessMetricsWidget,
} from '@/components/dashboard/dynamic-content-widgets'




// ============================================================================
// DATABASE TYPES
// ============================================================================

interface DbDashboardMetric {
  id: string
  user_id: string
  name: string
  value: number
  previous_value: number
  change: number
  change_percent: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  icon: string | null
  color: string | null
  is_positive: boolean
  target: number | null
  target_progress: number | null
  last_updated: string
  category: string
  description: string | null
  created_at: string
}

interface DbDashboardStats {
  id: string
  user_id: string
  earnings: number
  earnings_trend: number
  active_projects: number
  active_projects_trend: number
  completed_projects: number
  completed_projects_trend: number
  total_clients: number
  total_clients_trend: number
  hours_this_month: number
  hours_this_month_trend: number
  revenue_this_month: number
  revenue_this_month_trend: number
  average_project_value: number
  average_project_value_trend: number
  productivity_score: number
  productivity_score_trend: number
  pending_tasks: number
  overdue_tasks: number
  upcoming_meetings: number
  unread_messages: number
  last_updated: string
  created_at: string
}

interface DbDashboardNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  created_at: string
  action_url: string | null
  action_label: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

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
// COMPETITIVE UPGRADE MOCK DATA
// ============================================================================

const mockAIInsights = [
  { id: '1', query: "What's causing the API latency spike?", insight: "Database connection pool exhaustion on db-primary-01. Consider increasing max_connections from 100 to 200.", confidence: 0.94, category: 'engagement' as const, timestamp: new Date().toISOString() },
  { id: '2', query: "Which services need attention?", insight: "Payment Gateway showing 2.3% error rate, above 1% threshold. Related to upstream provider issues.", confidence: 0.89, category: 'conversion' as const, timestamp: new Date().toISOString() },
  { id: '3', query: "How's our infrastructure health?", insight: "Overall system health at 98.7%. Recommended: Scale api-gateway replicas from 3 to 5 before peak hours.", confidence: 0.91, category: 'revenue' as const, timestamp: new Date().toISOString() },
]

const mockOverviewCollaborators = [
  { id: '1', name: 'DevOps Team', avatar: '/avatars/devops.jpg', status: 'active' as const, lastActive: 'Just now', role: 'On-call' },
  { id: '2', name: 'Alex Kumar', avatar: '/avatars/alex.jpg', status: 'active' as const, lastActive: '1m ago', role: 'SRE Lead' },
  { id: '3', name: 'Lisa Park', avatar: '/avatars/lisa.jpg', status: 'idle' as const, lastActive: '20m ago', role: 'Platform Engineer' },
]

const mockOverviewPredictions = [
  { id: '1', metric: 'Uptime SLA', currentValue: 99.95, predictedValue: 99.98, confidence: 0.88, trend: 'up' as const, timeframe: 'End of month', factors: ['Infrastructure upgrades', 'Auto-scaling improvements'] },
  { id: '2', metric: 'Avg Response Time', currentValue: 145, predictedValue: 120, confidence: 0.82, trend: 'down' as const, timeframe: 'Next 7 days', factors: ['CDN optimization', 'Database indexing'] },
  { id: '3', metric: 'Error Rate', currentValue: 0.8, predictedValue: 0.5, confidence: 0.76, trend: 'down' as const, timeframe: 'Next 14 days', factors: ['Bug fixes deployed', 'Better error handling'] },
]

const mockOverviewActivities = [
  { id: '1', type: 'status_change' as const, title: 'Service recovered', description: 'Payment Gateway back to operational', user: { name: 'System', avatar: '' }, timestamp: new Date().toISOString(), metadata: {} },
  { id: '2', type: 'update' as const, title: 'Deployment completed', description: 'api-gateway v2.4.1 rolled out to production', user: { name: 'Alex Kumar', avatar: '/avatars/alex.jpg' }, timestamp: new Date(Date.now() - 1800000).toISOString(), metadata: {} },
  { id: '3', type: 'create' as const, title: 'Alert created', description: 'New monitor for Redis memory usage', user: { name: 'Lisa Park', avatar: '/avatars/lisa.jpg' }, timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: {} },
]

// Quick actions will be defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OverviewClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Data State
  const [dbMetrics, setDbMetrics] = useState<DbDashboardMetric[]>([])
  const [dbStats, setDbStats] = useState<DbDashboardStats | null>(null)
  const [dbNotifications, setDbNotifications] = useState<DbDashboardNotification[]>([])

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    orgName: 'Kazi Platform',
    environment: 'production',
    timezone: 'utc',
    dateFormat: 'iso',
    weekStartsOn: 'monday',
    darkMode: false,
    compactView: false,
    highContrastMode: false,
    showSparklines: true,
    animateTransitions: true,
    autoRefresh: true,
    refreshInterval: '30',
    defaultTimeRange: '4h',
    defaultTab: 'overview'
  })

  // Quick Action Dialog States
  const [showCreateAlertDialog, setShowCreateAlertDialog] = useState(false)
  const [showViewLogsDialog, setShowViewLogsDialog] = useState(false)
  const [showHealthCheckDialog, setShowHealthCheckDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)

  // Quick Actions with proper dialog handlers
  const overviewQuickActions = [
    { id: '1', label: 'Create Alert', icon: 'Bell', shortcut: '⌘A', action: () => setShowCreateAlertDialog(true) },
    { id: '2', label: 'View Logs', icon: 'FileText', shortcut: '⌘L', action: () => setShowViewLogsDialog(true) },
    { id: '3', label: 'Run Health Check', icon: 'Activity', shortcut: '⌘H', action: () => setShowHealthCheckDialog(true) },
    { id: '4', label: 'Deploy', icon: 'Rocket', shortcut: '⌘D', action: () => setShowDeployDialog(true) },
  ]

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

  // Fetch dashboard metrics from Supabase
  const fetchMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbMetrics(data || [])
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [supabase])

  // Fetch dashboard stats from Supabase
  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDbStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [supabase])

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('dashboard_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setDbNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [supabase])

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchMetrics(), fetchStats(), fetchNotifications()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchMetrics, fetchStats, fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_metrics' }, () => {
        fetchMetrics()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_stats' }, () => {
        fetchStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_notifications' }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchMetrics, fetchStats, fetchNotifications])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchMetrics(), fetchStats(), fetchNotifications()])
    toast.success('Dashboard refreshed', { description: 'Data has been updated' })
    setIsRefreshing(false)
  }

  // Export dashboard data
  const handleExportDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to export data')
        return
      }

      const exportData = {
        metrics: dbMetrics,
        stats: dbStats,
        notifications: dbNotifications,
        exportedAt: new Date().toISOString(),
        timeRange
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Dashboard exported', { description: 'Dashboard data has been downloaded' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', { description: 'Could not export dashboard data' })
    }
  }

  // Save settings to Supabase
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to save settings')
        return
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: settingsForm.darkMode ? 'dark' : 'light',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Settings saved', { description: 'Your preferences have been updated' })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      setDbNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Notification dismissed')
    } catch (error: any) {
      console.error('Error marking notification read:', error)
      toast.error('Failed to dismiss notification')
    }
  }

  // Clear all metrics (danger zone)
  const handleClearMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('dashboard_metrics')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setDbMetrics([])
      toast.success('Metrics cleared', { description: 'All metrics data has been deleted' })
    } catch (error: any) {
      console.error('Error clearing metrics:', error)
      toast.error('Failed to clear metrics', { description: error.message })
    }
  }

  // Reset dashboard stats (danger zone)
  const handleResetDashboards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('dashboard_stats')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setDbStats(null)
      toast.success('Dashboard reset', { description: 'Dashboard has been restored to defaults' })
    } catch (error: any) {
      console.error('Error resetting dashboard:', error)
      toast.error('Failed to reset dashboard', { description: error.message })
    }
  }

  // Delete all data (danger zone)
  const handleDeleteAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await Promise.all([
        supabase.from('dashboard_metrics').delete().eq('user_id', user.id),
        supabase.from('dashboard_stats').delete().eq('user_id', user.id),
        supabase.from('dashboard_notifications').delete().eq('user_id', user.id)
      ])

      setDbMetrics([])
      setDbStats(null)
      setDbNotifications([])
      toast.success('All data deleted', { description: 'All monitoring data has been permanently removed' })
    } catch (error: any) {
      console.error('Error deleting all data:', error)
      toast.error('Failed to delete data', { description: error.message })
    }
  }

  // Acknowledge alert (placeholder - can be connected to alerts table)
  const handleAcknowledgeAlert = (alertTitle: string) => {
    toast.success('Alert acknowledged', { description: `"${alertTitle}" has been acknowledged` })
  }

  // View details (placeholder)
  const handleViewDetails = (section: string) => {
    toast.info('View Details', { description: `Opening ${section} details...` })
  }

  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
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
              {/* Collaboration Indicator */}
              <CollaborationIndicator
                collaborators={mockOverviewCollaborators}
                maxVisible={3}
              />
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

            {/* Platform Stats & Business Metrics - Dynamic Content */}
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Platform Insights
              </h3>
              <PlatformStatsWidget />
              <div className="grid md:grid-cols-2 gap-6">
                <BusinessMetricsWidget />
                <Card className="border-0 shadow-sm dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickActionsToolbar />
                  </CardContent>
                </Card>
              </div>
            </div>
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
          {/* Settings Tab - Mixpanel Level Analytics Platform */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure dashboard platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'metrics', label: 'Metrics', icon: BarChart3 },
                        { id: 'alerts', label: 'Alerts', icon: Bell },
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Platform Stats Sidebar */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">API Usage</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Event Volume</span>
                        <span className="font-medium">2.4M/day</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Data Storage</span>
                        <span className="font-medium">847 GB</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Active Users</span>
                        <span className="font-medium">12,458</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Dashboards</span>
                        <span className="font-medium text-indigo-600">24</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Reports</span>
                        <span className="font-medium text-purple-600">156</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Basic platform configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="Kazi Platform" />
                          </div>
                          <div className="space-y-2">
                            <Label>Environment</Label>
                            <Select defaultValue="production">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="development">Development</SelectItem>
                                <SelectItem value="staging">Staging</SelectItem>
                                <SelectItem value="production">Production</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="iso">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                                <SelectItem value="us">MM/DD/YYYY</SelectItem>
                                <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-4 border-t">
                          <div>
                            <Label>Week Starts On</Label>
                            <p className="text-sm text-gray-500">First day of the week in reports</p>
                          </div>
                          <Select defaultValue="monday">
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunday">Sunday</SelectItem>
                              <SelectItem value="monday">Monday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize dashboard appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-gray-500">Use dark theme for dashboard</p>
                          </div>
                          <Switch
                            checked={settingsForm.darkMode}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, darkMode: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Compact View</Label>
                            <p className="text-sm text-gray-500">Show more data on screen</p>
                          </div>
                          <Switch
                            checked={settingsForm.compactView}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, compactView: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>High Contrast Mode</Label>
                            <p className="text-sm text-gray-500">Enhanced visibility for metrics</p>
                          </div>
                          <Switch
                            checked={settingsForm.highContrastMode}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, highContrastMode: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Sparklines</Label>
                            <p className="text-sm text-gray-500">Display mini charts in cards</p>
                          </div>
                          <Switch
                            checked={settingsForm.showSparklines}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, showSparklines: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Animate Transitions</Label>
                            <p className="text-sm text-gray-500">Smooth animations between states</p>
                          </div>
                          <Switch
                            checked={settingsForm.animateTransitions}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, animateTransitions: checked }))}
                          />
                        </div>
                        <div className="pt-4 border-t">
                          <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Settings'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Metrics Settings */}
                {settingsTab === 'metrics' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Metric Collection</CardTitle>
                        <CardDescription>Configure how metrics are collected</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Metric Collection</Label>
                            <p className="text-sm text-gray-500">Collect and aggregate metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Collection Interval</Label>
                            <Select defaultValue="10">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 seconds</SelectItem>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Aggregation Method</Label>
                            <Select defaultValue="avg">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="avg">Average</SelectItem>
                                <SelectItem value="sum">Sum</SelectItem>
                                <SelectItem value="max">Maximum</SelectItem>
                                <SelectItem value="min">Minimum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Include Host Tags</Label>
                            <p className="text-sm text-gray-500">Add host metadata to metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Custom Metric Tags</Label>
                            <p className="text-sm text-gray-500">Add custom tags to all metrics</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Configure how long metrics are stored</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="h-5 w-5 text-blue-600" />
                              <Label className="text-base">High Resolution</Label>
                            </div>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="15">15 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">1-second resolution</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <BarChart3 className="h-5 w-5 text-purple-600" />
                              <Label className="text-base">Aggregated</Label>
                            </div>
                            <Select defaultValue="90">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">1-minute resolution</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Metric Categories</CardTitle>
                        <CardDescription>Enable/disable metric categories</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Infrastructure', enabled: true, count: 156 },
                          { name: 'Application Performance', enabled: true, count: 89 },
                          { name: 'Business Metrics', enabled: true, count: 45 },
                          { name: 'Custom Events', enabled: true, count: 234 },
                          { name: 'User Behavior', enabled: false, count: 0 }
                        ].map((category, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <BarChart3 className={`h-4 w-4 ${category.enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-sm text-gray-500">{category.count} metrics</p>
                              </div>
                            </div>
                            <Switch defaultChecked={category.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Alert Settings */}
                {settingsTab === 'alerts' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Configure where alerts are sent</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Email', icon: Mail, config: 'team@company.com', enabled: true },
                          { name: 'Slack', icon: Webhook, config: '#alerts-production', enabled: true },
                          { name: 'PagerDuty', icon: Bell, config: 'On-call rotation', enabled: true },
                          { name: 'Microsoft Teams', icon: Webhook, config: 'DevOps Channel', enabled: false },
                          { name: 'Webhook', icon: Globe, config: 'https://hooks.example.com', enabled: false }
                        ].map((channel, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <channel.icon className={`h-4 w-4 ${channel.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{channel.name}</p>
                                <p className="text-sm text-gray-500">{channel.config}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Switch defaultChecked={channel.enabled} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Notification Channel
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Policies</CardTitle>
                        <CardDescription>Configure alert behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Alert Cooldown</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No cooldown</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Auto-resolve After</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Aggregate Similar Alerts</Label>
                            <p className="text-sm text-gray-500">Group related alerts together</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Weekend Quiet Hours</Label>
                            <p className="text-sm text-gray-500">Reduce non-critical alerts on weekends</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Include Context Data</Label>
                            <p className="text-sm text-gray-500">Add metrics and logs to alert notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Policies</CardTitle>
                        <CardDescription>Configure multi-tier alert escalation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { tier: 'Tier 1', team: 'On-call Engineer', delay: 'Immediate', channels: ['PagerDuty'] },
                          { tier: 'Tier 2', team: 'Team Lead', delay: '15 min', channels: ['PagerDuty', 'SMS'] },
                          { tier: 'Tier 3', team: 'Engineering Manager', delay: '30 min', channels: ['Phone'] }
                        ].map((policy, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{policy.tier}: {policy.team}</p>
                              <p className="text-sm text-gray-500">
                                After {policy.delay} → {policy.channels.join(', ')}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Escalation Tier
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Dashboard Settings */}
                {settingsTab === 'dashboard' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Auto-refresh</CardTitle>
                        <CardDescription>Configure automatic data refresh</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Auto-refresh</Label>
                            <p className="text-sm text-gray-500">Automatically update dashboard data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Refresh Interval</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Pause After Inactivity</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Refresh Indicator</Label>
                            <p className="text-sm text-gray-500">Display when data is refreshing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Default Views</CardTitle>
                        <CardDescription>Configure default dashboard settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Time Range</Label>
                            <Select defaultValue="4h">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">Last 1 hour</SelectItem>
                                <SelectItem value="4h">Last 4 hours</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Tab</Label>
                            <Select defaultValue="overview">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                                <SelectItem value="alerts">Alerts</SelectItem>
                                <SelectItem value="logs">Logs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Remember Last View</Label>
                            <p className="text-sm text-gray-500">Open to last viewed tab</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Persist Filters</Label>
                            <p className="text-sm text-gray-500">Remember applied filters</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Widget Settings</CardTitle>
                        <CardDescription>Configure dashboard widgets</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Trend Indicators</Label>
                            <p className="text-sm text-gray-500">Display up/down arrows on metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Sparklines</Label>
                            <p className="text-sm text-gray-500">Mini charts in metric cards</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Color-coded Status</Label>
                            <p className="text-sm text-gray-500">Use colors for health status</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hover Tooltips</Label>
                            <p className="text-sm text-gray-500">Show details on hover</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Providers</CardTitle>
                        <CardDescription>Connect to cloud infrastructure</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'AWS CloudWatch', status: 'connected', lastSync: '2 min ago' },
                          { name: 'Google Cloud Monitoring', status: 'connected', lastSync: '5 min ago' },
                          { name: 'Azure Monitor', status: 'not_connected', lastSync: null },
                          { name: 'Datadog', status: 'not_connected', lastSync: null }
                        ].map((provider, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${provider.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Cloud className={`h-4 w-4 ${provider.status === 'connected' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                {provider.lastSync && (
                                  <p className="text-sm text-gray-500">Last sync: {provider.lastSync}</p>
                                )}
                              </div>
                            </div>
                            <Button variant={provider.status === 'connected' ? 'outline' : 'default'} size="sm">
                              {provider.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="kazi-prod-xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last used: 2 min ago</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <Label>Enable API</Label>
                            <p className="text-sm text-gray-500">Allow programmatic access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Rate Limiting</Label>
                            <p className="text-sm text-gray-500">1000 requests/minute</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Send data to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Metrics Export', url: 'https://metrics.example.com/ingest', events: ['metrics'] },
                          { name: 'Alert Handler', url: 'https://alerts.example.com/webhook', events: ['alerts'] }
                        ].map((webhook, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{webhook.name}</p>
                              <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Export dashboard data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select defaultValue="json">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="parquet">Parquet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Range</Label>
                            <Select defaultValue="7d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1d">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleExportDashboard}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Security and compliance settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Require 2FA for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP Allowlist</Label>
                            <p className="text-sm text-gray-500">Restrict access by IP</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all configuration changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Data Encryption</Label>
                            <p className="text-sm text-gray-500">Encrypt data at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Clear All Metrics</p>
                            <p className="text-sm text-gray-500">Delete all stored metrics data</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleClearMetrics}
                          >
                            Clear Metrics
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Reset All Dashboards</p>
                            <p className="text-sm text-gray-500">Restore default dashboard layouts</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleResetDashboards}
                          >
                            Reset Dashboards
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Delete All Data</p>
                            <p className="text-sm text-gray-500">Permanently delete all monitoring data</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeleteAllData}>
                            Delete All
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

        {/* AI-Powered Infrastructure Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AIInsightsPanel
            insights={mockAIInsights}
            onAskQuestion={(q) => console.log('Infrastructure Question:', q)}
          />
          <PredictiveAnalytics predictions={mockOverviewPredictions} />
        </div>

        {/* Activity Feed */}
        <div className="mt-6">
          <ActivityFeed
            activities={mockOverviewActivities}
            maxItems={5}
            showFilters={true}
          />
        </div>

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar actions={overviewQuickActions} />

        {/* Create Alert Dialog */}
        <Dialog open={showCreateAlertDialog} onOpenChange={setShowCreateAlertDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create New Alert
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alert-name">Alert Name</Label>
                <Input id="alert-name" placeholder="Enter alert name..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-service">Service</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api-gateway">API Gateway</SelectItem>
                    <SelectItem value="payment-service">Payment Service</SelectItem>
                    <SelectItem value="user-service">User Service</SelectItem>
                    <SelectItem value="notification-service">Notification Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-severity">Severity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateAlertDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Alert created successfully')
                  setShowCreateAlertDialog(false)
                }}>
                  Create Alert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Logs Dialog */}
        <Dialog open={showViewLogsDialog} onOpenChange={setShowViewLogsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Search logs..." className="flex-1" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[400px] rounded-lg border">
                <div className="p-4 space-y-2 font-mono text-sm">
                  {mockLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="p-2 rounded bg-gray-50 dark:bg-gray-800 flex items-start gap-2">
                      <Badge className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                      <span className="text-gray-500 text-xs">{formatDate(log.timestamp)}</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowViewLogsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Health Check Dialog */}
        <Dialog open={showHealthCheckDialog} onOpenChange={setShowHealthCheckDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Check
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>API Gateway</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Database</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Cache Server</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span>Message Queue</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">Degraded</Badge>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Overall System Status</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowHealthCheckDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  toast.success('Health check completed - All systems operational')
                  setShowHealthCheckDialog(false)
                }}>
                  Run Again
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Deploy Application
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deploy-environment">Environment</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deploy-version">Version</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest (v2.4.2)</SelectItem>
                    <SelectItem value="v2.4.1">v2.4.1</SelectItem>
                    <SelectItem value="v2.4.0">v2.4.0</SelectItem>
                    <SelectItem value="v2.3.5">v2.3.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Production Deployment</p>
                    <p className="text-yellow-700 dark:text-yellow-300">This action will deploy to production. Please ensure all tests have passed.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Deployment initiated successfully')
                  setShowDeployDialog(false)
                }}>
                  Deploy Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
