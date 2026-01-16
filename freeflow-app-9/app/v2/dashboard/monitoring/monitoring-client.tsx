'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Bell,
  Layers,
  Container,
  Terminal,
  FileText,
  AlertCircle,
  XCircle,
  Gauge,
  Users,
  MapPin,
  MemoryStick,
  Webhook,
  AlertOctagon,
  Sliders,
  Mail,
  Copy
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




// ============================================================================
// TYPE DEFINITIONS - Datadog Level Infrastructure Monitoring
// ============================================================================

type HostStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'offline'
type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type AlertStatus = 'triggered' | 'acknowledged' | 'resolved' | 'muted'
type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage'
type MetricType = 'gauge' | 'counter' | 'histogram' | 'rate'
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface Host {
  id: string
  name: string
  hostname: string
  ip_address: string
  os: string
  status: HostStatus
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  load_avg: number
  uptime_seconds: number
  processes: number
  containers: number
  region: string
  availability_zone: string
  instance_type: string
  tags: string[]
  last_seen_at: string
  agent_version: string
}

interface Service {
  id: string
  name: string
  status: ServiceStatus
  type: 'web' | 'api' | 'database' | 'cache' | 'queue' | 'worker'
  hosts_count: number
  requests_per_sec: number
  error_rate: number
  latency_p50: number
  latency_p95: number
  latency_p99: number
  apdex_score: number
  dependencies: string[]
  last_deploy_at: string
  version: string
}

interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  host_id: string | null
  host_name: string | null
  service_name: string | null
  metric_name: string
  threshold: number
  current_value: number
  triggered_at: string
  acknowledged_at: string | null
  acknowledged_by: string | null
  resolved_at: string | null
  escalation_level: number
  notification_sent: boolean
}

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  host: string
  message: string
  trace_id: string | null
  span_id: string | null
  attributes: Record<string, unknown>
}

interface Metric {
  id: string
  name: string
  display_name: string
  type: MetricType
  unit: string
  current_value: number
  previous_value: number
  change_percent: number
  tags: string[]
}

interface Dashboard {
  id: string
  name: string
  description: string
  widgets_count: number
  created_by: string
  is_shared: boolean
  last_modified_at: string
}

interface SLO {
  id: string
  name: string
  target: number
  current: number
  status: 'met' | 'at_risk' | 'breached'
  time_window: '7d' | '30d' | '90d'
  service: string
  metric_type: string
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const mockHosts: Host[] = [
  {
    id: 'host-001',
    name: 'web-prod-01',
    hostname: 'ip-10-0-1-101.ec2.internal',
    ip_address: '10.0.1.101',
    os: 'Ubuntu 22.04 LTS',
    status: 'healthy',
    cpu_usage: 42,
    memory_usage: 68,
    disk_usage: 55,
    network_in: 245.6,
    network_out: 123.4,
    load_avg: 2.34,
    uptime_seconds: 2592000,
    processes: 156,
    containers: 12,
    region: 'us-west-2',
    availability_zone: 'us-west-2a',
    instance_type: 'c5.2xlarge',
    tags: ['env:production', 'service:web', 'team:platform'],
    last_seen_at: '2024-01-15T10:30:00Z',
    agent_version: '7.45.0'
  },
  {
    id: 'host-002',
    name: 'web-prod-02',
    hostname: 'ip-10-0-1-102.ec2.internal',
    ip_address: '10.0.1.102',
    os: 'Ubuntu 22.04 LTS',
    status: 'healthy',
    cpu_usage: 38,
    memory_usage: 62,
    disk_usage: 48,
    network_in: 198.3,
    network_out: 98.7,
    load_avg: 1.87,
    uptime_seconds: 2592000,
    processes: 142,
    containers: 10,
    region: 'us-west-2',
    availability_zone: 'us-west-2b',
    instance_type: 'c5.2xlarge',
    tags: ['env:production', 'service:web', 'team:platform'],
    last_seen_at: '2024-01-15T10:30:00Z',
    agent_version: '7.45.0'
  },
  {
    id: 'host-003',
    name: 'api-prod-01',
    hostname: 'ip-10-0-2-101.ec2.internal',
    ip_address: '10.0.2.101',
    os: 'Amazon Linux 2',
    status: 'warning',
    cpu_usage: 78,
    memory_usage: 85,
    disk_usage: 72,
    network_in: 567.8,
    network_out: 234.5,
    load_avg: 4.56,
    uptime_seconds: 1728000,
    processes: 234,
    containers: 18,
    region: 'us-west-2',
    availability_zone: 'us-west-2a',
    instance_type: 'c5.4xlarge',
    tags: ['env:production', 'service:api', 'team:backend'],
    last_seen_at: '2024-01-15T10:30:00Z',
    agent_version: '7.45.0'
  },
  {
    id: 'host-004',
    name: 'db-prod-01',
    hostname: 'ip-10-0-3-101.ec2.internal',
    ip_address: '10.0.3.101',
    os: 'Ubuntu 20.04 LTS',
    status: 'healthy',
    cpu_usage: 25,
    memory_usage: 78,
    disk_usage: 67,
    network_in: 89.4,
    network_out: 456.7,
    load_avg: 1.23,
    uptime_seconds: 5184000,
    processes: 89,
    containers: 0,
    region: 'us-west-2',
    availability_zone: 'us-west-2a',
    instance_type: 'r5.2xlarge',
    tags: ['env:production', 'service:database', 'team:data'],
    last_seen_at: '2024-01-15T10:30:00Z',
    agent_version: '7.44.1'
  },
  {
    id: 'host-005',
    name: 'cache-prod-01',
    hostname: 'ip-10-0-4-101.ec2.internal',
    ip_address: '10.0.4.101',
    os: 'Amazon Linux 2',
    status: 'critical',
    cpu_usage: 92,
    memory_usage: 95,
    disk_usage: 45,
    network_in: 789.2,
    network_out: 654.3,
    load_avg: 8.76,
    uptime_seconds: 864000,
    processes: 67,
    containers: 3,
    region: 'us-west-2',
    availability_zone: 'us-west-2b',
    instance_type: 'r5.xlarge',
    tags: ['env:production', 'service:cache', 'team:platform'],
    last_seen_at: '2024-01-15T10:30:00Z',
    agent_version: '7.45.0'
  },
  {
    id: 'host-006',
    name: 'worker-prod-01',
    hostname: 'ip-10-0-5-101.ec2.internal',
    ip_address: '10.0.5.101',
    os: 'Ubuntu 22.04 LTS',
    status: 'healthy',
    cpu_usage: 55,
    memory_usage: 45,
    disk_usage: 32,
    network_in: 45.6,
    network_out: 23.4,
    load_avg: 2.12,
    uptime_seconds: 432000,
    processes: 45,
    containers: 8,
    region: 'us-west-2',
    availability_zone: 'us-west-2c',
    instance_type: 'c5.xlarge',
    tags: ['env:production', 'service:worker', 'team:backend'],
    last_seen_at: '2024-01-15T10:30:00Z',
    agent_version: '7.45.0'
  }
]

const mockServices: Service[] = [
  { id: 's1', name: 'web-frontend', status: 'operational', type: 'web', hosts_count: 4, requests_per_sec: 1250, error_rate: 0.12, latency_p50: 45, latency_p95: 120, latency_p99: 250, apdex_score: 0.95, dependencies: ['api-gateway', 'cdn'], last_deploy_at: '2024-01-14T16:00:00Z', version: '2.4.1' },
  { id: 's2', name: 'api-gateway', status: 'operational', type: 'api', hosts_count: 3, requests_per_sec: 8500, error_rate: 0.08, latency_p50: 12, latency_p95: 45, latency_p99: 120, apdex_score: 0.98, dependencies: ['user-service', 'order-service', 'inventory-service'], last_deploy_at: '2024-01-15T09:00:00Z', version: '3.1.0' },
  { id: 's3', name: 'user-service', status: 'operational', type: 'api', hosts_count: 2, requests_per_sec: 2100, error_rate: 0.05, latency_p50: 8, latency_p95: 25, latency_p99: 60, apdex_score: 0.99, dependencies: ['postgres-primary', 'redis-cluster'], last_deploy_at: '2024-01-12T14:00:00Z', version: '1.8.2' },
  { id: 's4', name: 'postgres-primary', status: 'operational', type: 'database', hosts_count: 2, requests_per_sec: 5600, error_rate: 0.01, latency_p50: 2, latency_p95: 8, latency_p99: 15, apdex_score: 0.99, dependencies: [], last_deploy_at: '2024-01-01T00:00:00Z', version: '15.2' },
  { id: 's5', name: 'redis-cluster', status: 'degraded', type: 'cache', hosts_count: 3, requests_per_sec: 45000, error_rate: 2.5, latency_p50: 0.5, latency_p95: 2, latency_p99: 8, apdex_score: 0.85, dependencies: [], last_deploy_at: '2024-01-10T08:00:00Z', version: '7.0.5' },
  { id: 's6', name: 'worker-queue', status: 'operational', type: 'queue', hosts_count: 2, requests_per_sec: 890, error_rate: 0.15, latency_p50: 150, latency_p95: 500, latency_p99: 1200, apdex_score: 0.92, dependencies: ['postgres-primary', 'redis-cluster'], last_deploy_at: '2024-01-13T11:00:00Z', version: '2.1.0' }
]

const mockAlerts: Alert[] = [
  { id: 'a1', title: 'High CPU Usage', message: 'CPU usage exceeded 90% on cache-prod-01', severity: 'critical', status: 'triggered', source: 'system.cpu', host_id: 'host-005', host_name: 'cache-prod-01', service_name: 'redis-cluster', metric_name: 'system.cpu.user', threshold: 90, current_value: 92, triggered_at: '2024-01-15T10:25:00Z', acknowledged_at: null, acknowledged_by: null, resolved_at: null, escalation_level: 1, notification_sent: true },
  { id: 'a2', title: 'High Memory Usage', message: 'Memory usage exceeded 90% on cache-prod-01', severity: 'critical', status: 'triggered', source: 'system.memory', host_id: 'host-005', host_name: 'cache-prod-01', service_name: 'redis-cluster', metric_name: 'system.mem.used', threshold: 90, current_value: 95, triggered_at: '2024-01-15T10:26:00Z', acknowledged_at: null, acknowledged_by: null, resolved_at: null, escalation_level: 1, notification_sent: true },
  { id: 'a3', title: 'API Error Rate Elevated', message: 'Error rate exceeded 2% on api-gateway', severity: 'high', status: 'acknowledged', source: 'apm.error_rate', host_id: null, host_name: null, service_name: 'api-gateway', metric_name: 'trace.error_rate', threshold: 2, current_value: 2.5, triggered_at: '2024-01-15T09:45:00Z', acknowledged_at: '2024-01-15T09:50:00Z', acknowledged_by: 'Sarah Chen', resolved_at: null, escalation_level: 0, notification_sent: true },
  { id: 'a4', title: 'High Load Average', message: 'Load average exceeded threshold on api-prod-01', severity: 'medium', status: 'resolved', source: 'system.load', host_id: 'host-003', host_name: 'api-prod-01', service_name: 'api-gateway', metric_name: 'system.load.1', threshold: 4, current_value: 4.56, triggered_at: '2024-01-15T08:30:00Z', acknowledged_at: '2024-01-15T08:35:00Z', acknowledged_by: 'Mike Wilson', resolved_at: '2024-01-15T09:00:00Z', escalation_level: 0, notification_sent: true },
  { id: 'a5', title: 'Disk Usage Warning', message: 'Disk usage approaching threshold on db-prod-01', severity: 'low', status: 'muted', source: 'system.disk', host_id: 'host-004', host_name: 'db-prod-01', service_name: 'postgres-primary', metric_name: 'system.disk.used', threshold: 75, current_value: 67, triggered_at: '2024-01-15T07:00:00Z', acknowledged_at: null, acknowledged_by: null, resolved_at: null, escalation_level: 0, notification_sent: false }
]

const mockLogs: LogEntry[] = [
  { id: 'log-001', timestamp: '2024-01-15T10:30:45Z', level: 'error', service: 'redis-cluster', host: 'cache-prod-01', message: 'Out of memory - killing process', trace_id: null, span_id: null, attributes: { pid: 12345, memory_used: '95%' } },
  { id: 'log-002', timestamp: '2024-01-15T10:30:30Z', level: 'warn', service: 'api-gateway', host: 'api-prod-01', message: 'Request timeout after 30s', trace_id: 'trace-abc123', span_id: 'span-xyz789', attributes: { endpoint: '/api/v1/orders', method: 'POST' } },
  { id: 'log-003', timestamp: '2024-01-15T10:30:15Z', level: 'info', service: 'user-service', host: 'web-prod-01', message: 'User login successful', trace_id: 'trace-def456', span_id: 'span-uvw123', attributes: { user_id: 'u-12345', ip: '192.168.1.100' } },
  { id: 'log-004', timestamp: '2024-01-15T10:30:00Z', level: 'debug', service: 'worker-queue', host: 'worker-prod-01', message: 'Processing job batch', trace_id: 'trace-ghi789', span_id: 'span-rst456', attributes: { batch_size: 100, queue: 'emails' } },
  { id: 'log-005', timestamp: '2024-01-15T10:29:45Z', level: 'error', service: 'api-gateway', host: 'api-prod-01', message: 'Database connection failed', trace_id: 'trace-jkl012', span_id: 'span-opq789', attributes: { error_code: 'ECONNREFUSED', attempts: 3 } }
]

const mockSLOs: SLO[] = [
  { id: 'slo-001', name: 'API Availability', target: 99.9, current: 99.95, status: 'met', time_window: '30d', service: 'api-gateway', metric_type: 'availability' },
  { id: 'slo-002', name: 'API Latency P95', target: 100, current: 120, status: 'breached', time_window: '7d', service: 'api-gateway', metric_type: 'latency_p95' },
  { id: 'slo-003', name: 'Error Rate', target: 0.5, current: 0.35, status: 'met', time_window: '30d', service: 'user-service', metric_type: 'error_rate' },
  { id: 'slo-004', name: 'Database Availability', target: 99.99, current: 99.98, status: 'at_risk', time_window: '30d', service: 'postgres-primary', metric_type: 'availability' }
]

const mockDashboards: Dashboard[] = [
  { id: 'dash-001', name: 'Infrastructure Overview', description: 'High-level view of all infrastructure', widgets_count: 12, created_by: 'Sarah Chen', is_shared: true, last_modified_at: '2024-01-14T10:00:00Z' },
  { id: 'dash-002', name: 'API Performance', description: 'API latency and error rates', widgets_count: 8, created_by: 'Mike Wilson', is_shared: true, last_modified_at: '2024-01-15T09:00:00Z' },
  { id: 'dash-003', name: 'Database Metrics', description: 'PostgreSQL performance metrics', widgets_count: 10, created_by: 'Alex Johnson', is_shared: false, last_modified_at: '2024-01-13T14:00:00Z' },
  { id: 'dash-004', name: 'Cache Performance', description: 'Redis cluster monitoring', widgets_count: 6, created_by: 'Emma Davis', is_shared: true, last_modified_at: '2024-01-15T08:00:00Z' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getHostStatusColor = (status: HostStatus): string => {
  switch (status) {
    case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'unknown': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getServiceStatusColor = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'degraded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'partial_outage': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'major_outage': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getAlertSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'low': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getAlertStatusColor = (status: AlertStatus): string => {
  switch (status) {
    case 'triggered': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'acknowledged': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'muted': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getLogLevelColor = (level: LogLevel): string => {
  switch (level) {
    case 'debug': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'error': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'fatal': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getSLOStatusColor = (status: string): string => {
  switch (status) {
    case 'met': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'at_risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'breached': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}d ${hours}h`
}

const getMetricColor = (value: number, threshold: number): string => {
  if (value >= threshold) return 'text-red-600'
  if (value >= threshold * 0.8) return 'text-yellow-600'
  return 'text-green-600'
}

// Enhanced Monitoring Mock Data
const mockMonitoringAIInsights = [
  { id: '1', type: 'success' as const, title: 'Infrastructure Health', description: 'All 24 hosts healthy. Zero critical alerts in 48 hours.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'info' as const, title: 'Cost Optimization', description: '3 instances underutilized. Consider downsizing to save $450/mo.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Costs' },
  { id: '3', type: 'warning' as const, title: 'Disk Space', description: 'prod-db-01 at 85% disk usage. Cleanup recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Resources' },
]

const mockMonitoringCollaborators = [
  { id: '1', name: 'Infra Lead', avatar: '/avatars/infra.jpg', status: 'online' as const, role: 'Infrastructure', lastActive: 'Now' },
  { id: '2', name: 'Cloud Architect', avatar: '/avatars/cloud.jpg', status: 'online' as const, role: 'Architecture', lastActive: '5m ago' },
  { id: '3', name: 'SysAdmin', avatar: '/avatars/sys.jpg', status: 'away' as const, role: 'Operations', lastActive: '20m ago' },
]

const mockMonitoringPredictions = [
  { id: '1', label: 'Uptime', current: 99.95, target: 99.99, predicted: 99.97, confidence: 90, trend: 'up' as const },
  { id: '2', label: 'CPU Usage', current: 45, target: 70, predicted: 52, confidence: 82, trend: 'up' as const },
  { id: '3', label: 'Memory', current: 62, target: 80, predicted: 68, confidence: 85, trend: 'up' as const },
]

const mockMonitoringActivities = [
  { id: '1', user: 'Infra Lead', action: 'provisioned', target: '2 new app servers', timestamp: '30m ago', type: 'success' as const },
  { id: '2', user: 'Cloud Architect', action: 'updated', target: 'auto-scaling policies', timestamp: '1h ago', type: 'info' as const },
  { id: '3', user: 'SysAdmin', action: 'patched', target: '8 servers', timestamp: '3h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Database types
interface DbServer {
  id: string
  user_id: string
  server_name: string
  server_type: string
  status: string
  location: string | null
  ip_address: string | null
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_throughput: number
  uptime_percentage: number
  requests_per_hour: number
  last_health_check: string
  configuration: Record<string, unknown>
  tags: string[]
  created_at: string
  updated_at: string
}

interface DbAlert {
  id: string
  user_id: string
  server_id: string | null
  alert_type: string
  severity: string
  title: string
  description: string | null
  status: string
  acknowledged_at: string | null
  acknowledged_by: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
}

// Form state types
interface ServerFormData {
  server_name: string
  server_type: string
  location: string
  ip_address: string
  tags: string
}

interface AlertFormData {
  title: string
  alert_type: string
  severity: string
  description: string
  server_id: string
}

const initialServerForm: ServerFormData = {
  server_name: '',
  server_type: 'production',
  location: '',
  ip_address: '',
  tags: ''
}

const initialAlertForm: AlertFormData = {
  title: '',
  alert_type: 'cpu_high',
  severity: 'warning',
  description: '',
  server_id: ''
}

export default function MonitoringClient() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('infrastructure')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<HostStatus | 'all'>('all')
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Database state
  const [dbServers, setDbServers] = useState<DbServer[]>([])
  const [dbAlerts, setDbAlerts] = useState<DbAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Dialog state
  const [showAddServerDialog, setShowAddServerDialog] = useState(false)
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false)
  const [showDashboardsDialog, setShowDashboardsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showMetricsDialog, setShowMetricsDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showConfigureChannelDialog, setShowConfigureChannelDialog] = useState(false)
  const [showAddChannelDialog, setShowAddChannelDialog] = useState(false)
  const [showCloudIntegrationDialog, setShowCloudIntegrationDialog] = useState(false)
  const [showDatabaseIntegrationDialog, setShowDatabaseIntegrationDialog] = useState(false)
  const [showResetAlertsDialog, setShowResetAlertsDialog] = useState(false)
  const [showRemoveHostsDialog, setShowRemoveHostsDialog] = useState(false)
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false)
  const [showSSHDialog, setShowSSHDialog] = useState(false)
  const [showHostMetricsDialog, setShowHostMetricsDialog] = useState(false)
  const [showHostLogsDialog, setShowHostLogsDialog] = useState(false)
  const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [serverForm, setServerForm] = useState<ServerFormData>(initialServerForm)
  const [alertForm, setAlertForm] = useState<AlertFormData>(initialAlertForm)

  // Quick actions with proper dialog handlers
  const monitoringQuickActions = [
    { id: '1', label: 'Add Host', icon: 'Server', shortcut: 'H', action: () => setShowAddServerDialog(true) },
    { id: '2', label: 'Dashboards', icon: 'LayoutDashboard', shortcut: 'D', action: () => setShowDashboardsDialog(true) },
    { id: '3', label: 'Alerts', icon: 'Bell', shortcut: 'A', action: () => setShowAlertsDialog(true) },
    { id: '4', label: 'Metrics', icon: 'Activity', shortcut: 'M', action: () => setShowMetricsDialog(true) },
  ]

  // Fetch servers from Supabase
  const fetchServers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbServers(data || [])
    } catch (error) {
      console.error('Error fetching servers:', error)
    }
  }, [supabase])

  // Fetch alerts from Supabase
  const fetchAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }, [supabase])

  // Load data on mount
  useEffect(() => {
    fetchServers()
    fetchAlerts()
  }, [fetchServers, fetchAlerts])

  // Create server
  const handleCreateServer = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('servers').insert({
        user_id: user.id,
        server_name: serverForm.server_name,
        server_type: serverForm.server_type,
        location: serverForm.location || null,
        ip_address: serverForm.ip_address || null,
        tags: serverForm.tags ? serverForm.tags.split(',').map(t => t.trim()) : [],
        status: 'healthy',
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 0
      })

      if (error) throw error

      toast.success('Server added' has been registered` })
      setShowAddServerDialog(false)
      setServerForm(initialServerForm)
      fetchServers()
    } catch (error) {
      toast.error('Failed to add server')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete server
  const handleDeleteServer = async (serverId: string) => {
    try {
      const { error } = await supabase
        .from('servers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', serverId)

      if (error) throw error

      toast.success('Server removed')
      fetchServers()
    } catch (error) {
      toast.error('Failed to remove server')
    }
  }

  // Create alert
  const handleCreateAlert = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('system_alerts').insert({
        user_id: user.id,
        title: alertForm.title,
        alert_type: alertForm.alert_type,
        severity: alertForm.severity,
        description: alertForm.description || null,
        server_id: alertForm.server_id || null,
        status: 'active'
      })

      if (error) throw error

      toast.success('Alert created')
      setShowAddAlertDialog(false)
      setAlertForm(initialAlertForm)
      fetchAlerts()
    } catch (error) {
      toast.error('Failed to create alert')
    } finally {
      setIsLoading(false)
    }
  }

  // Acknowledge alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('system_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id
        })
        .eq('id', alertId)

      if (error) throw error

      toast.success('Alert acknowledged')
      fetchAlerts()
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  // Resolve alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('system_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', alertId)

      if (error) throw error

      toast.success('Alert resolved')
      fetchAlerts()
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  // Refresh metrics
  const handleRefreshMetrics = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchServers(), fetchAlerts()])
      toast.success('Metrics refreshed')
    } catch (error) {
      toast.error('Failed to refresh')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtered hosts
  const filteredHosts = useMemo(() => {
    return mockHosts.filter(host => {
      const matchesSearch =
        host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.ip_address.includes(searchQuery)
      const matchesStatus = statusFilter === 'all' || host.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const total = mockHosts.length
    const healthy = mockHosts.filter(h => h.status === 'healthy').length
    const warning = mockHosts.filter(h => h.status === 'warning').length
    const critical = mockHosts.filter(h => h.status === 'critical').length
    const avgCpu = Math.round(mockHosts.reduce((acc, h) => acc + h.cpu_usage, 0) / total)
    const avgMemory = Math.round(mockHosts.reduce((acc, h) => acc + h.memory_usage, 0) / total)
    const totalContainers = mockHosts.reduce((acc, h) => acc + h.containers, 0)
    const activeAlerts = mockAlerts.filter(a => a.status === 'triggered').length

    return { total, healthy, warning, critical, avgCpu, avgMemory, totalContainers, activeAlerts }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Monitoring</h1>
              <p className="text-gray-500 dark:text-gray-400">Datadog level observability platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefreshMetrics} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-slate-500 to-gray-600 text-white"
              onClick={() => setShowAddServerDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Host
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Hosts', value: stats.total.toString(), icon: Server, color: 'from-slate-500 to-gray-500', change: 0 },
            { label: 'Healthy', value: stats.healthy.toString(), icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: 5.2 },
            { label: 'Warning', value: stats.warning.toString(), icon: AlertTriangle, color: 'from-yellow-500 to-orange-500', change: -2.1 },
            { label: 'Critical', value: stats.critical.toString(), icon: XCircle, color: 'from-red-500 to-rose-500', change: 0 },
            { label: 'Avg CPU', value: `${stats.avgCpu}%`, icon: Cpu, color: 'from-blue-500 to-cyan-500', change: 3.4 },
            { label: 'Avg Memory', value: `${stats.avgMemory}%`, icon: MemoryStick, color: 'from-purple-500 to-violet-500', change: 8.7 },
            { label: 'Containers', value: stats.totalContainers.toString(), icon: Container, color: 'from-teal-500 to-cyan-500', change: 12.3 },
            { label: 'Active Alerts', value: stats.activeAlerts.toString(), icon: Bell, color: 'from-orange-500 to-red-500', change: 0 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="infrastructure" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="apm" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              APM
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {stats.activeAlerts > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{stats.activeAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Host List</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search hosts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'healthy', 'warning', 'critical'] as const).map(status => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-slate-600' : ''}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredHosts.map(host => (
                    <div
                      key={host.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedHost(host)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          host.status === 'healthy' ? 'bg-green-100 text-green-600' :
                          host.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          host.status === 'critical' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {host.name}
                            </span>
                            <Badge className={getHostStatusColor(host.status)}>
                              {host.status}
                            </Badge>
                            {host.containers > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Container className="w-3 h-3 mr-1" />
                                {host.containers}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {host.ip_address} • {host.instance_type} • {host.os}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {host.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Uptime: {formatUptime(host.uptime_seconds)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Agent v{host.agent_version}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-center">
                          <div>
                            <p className={`text-lg font-bold ${getMetricColor(host.cpu_usage, 80)}`}>
                              {host.cpu_usage}%
                            </p>
                            <p className="text-xs text-gray-500">CPU</p>
                          </div>
                          <div>
                            <p className={`text-lg font-bold ${getMetricColor(host.memory_usage, 80)}`}>
                              {host.memory_usage}%
                            </p>
                            <p className="text-xs text-gray-500">Memory</p>
                          </div>
                          <div>
                            <p className={`text-lg font-bold ${getMetricColor(host.disk_usage, 80)}`}>
                              {host.disk_usage}%
                            </p>
                            <p className="text-xs text-gray-500">Disk</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-600">
                              {host.load_avg.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">Load</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APM Tab */}
          <TabsContent value="apm" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {mockServices.map(service => (
                <Card key={service.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={getServiceStatusColor(service.status)}>
                        {service.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{service.type} • v{service.version}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{service.requests_per_sec}</p>
                        <p className="text-xs text-gray-500">req/s</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${service.error_rate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                          {service.error_rate}%
                        </p>
                        <p className="text-xs text-gray-500">Errors</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{service.latency_p50}ms</p>
                        <p className="text-xs text-gray-500">P50</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Apdex</span>
                        <span className={`font-semibold ${service.apdex_score >= 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {service.apdex_score.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Hosts</span>
                        <span className="font-semibold">{service.hosts_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SLO Status</CardTitle>
                <CardDescription>Service Level Objectives tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSLOs.map(slo => (
                    <div key={slo.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{slo.name}</span>
                          <Badge className={getSLOStatusColor(slo.status)}>{slo.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{slo.service} • {slo.time_window}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {slo.current}
                          <span className="text-sm text-gray-500 ml-1">/ {slo.target}</span>
                        </p>
                        <Progress value={(slo.current / slo.target) * 100} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Log Stream</CardTitle>
                  <div className="flex items-center gap-3">
                    <Input placeholder="Search logs..." className="w-64" />
                    <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y font-mono text-sm">
                  {mockLogs.map(log => (
                    <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge className={getLogLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-blue-600">[{log.service}]</span>
                        <span className="text-purple-600">{log.host}</span>
                        <span className="flex-1 text-gray-700 dark:text-gray-300">
                          {log.message}
                        </span>
                      </div>
                      {log.trace_id && (
                        <div className="mt-1 ml-20 text-xs text-gray-400">
                          trace_id: {log.trace_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Active Alerts ({dbAlerts.filter(a => a.status === 'active').length} active)</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowAddAlertDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Database Alerts */}
                  {dbAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{alert.title}</span>
                            <Badge className={
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }>{alert.severity}</Badge>
                            <Badge className={
                              alert.status === 'active' ? 'bg-red-100 text-red-800' :
                              alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>{alert.status}</Badge>
                          </div>
                          {alert.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{alert.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                            <span>Type: {alert.alert_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          {(alert.status === 'active' || alert.status === 'acknowledged') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Mock Alerts for demo */}
                  {mockAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{alert.title}</span>
                            <Badge className={getAlertSeverityColor(alert.severity)}>{alert.severity}</Badge>
                            <Badge className={getAlertStatusColor(alert.status)}>{alert.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Triggered: {new Date(alert.triggered_at).toLocaleString()}</span>
                            {alert.host_name && <span>Host: {alert.host_name}</span>}
                            {alert.service_name && <span>Service: {alert.service_name}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{alert.current_value}</p>
                          <p className="text-xs text-gray-500">Threshold: {alert.threshold}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dbAlerts.length === 0 && mockAlerts.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No alerts. Click "Create Alert" to add one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockDashboards.map(dashboard => (
                <Card key={dashboard.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      {dashboard.is_shared && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{dashboard.widgets_count} widgets</span>
                      <span className="text-gray-500">by {dashboard.created_by}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-gray-500">Create Dashboard</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'agents', label: 'Agents', icon: Server },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'thresholds', label: 'Thresholds', icon: Gauge },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={settingsTab === item.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                      onClick={() => setSettingsTab(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* Monitoring Stats */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hosts</span>
                      <Badge variant="secondary">{stats.total}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Healthy</span>
                      <Badge className="bg-green-100 text-green-700">{stats.healthy}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span>
                      <Badge className={stats.activeAlerts > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>{stats.activeAlerts}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Containers</span>
                      <Badge variant="secondary">{stats.totalContainers}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Settings</CardTitle>
                        <CardDescription>Configure your monitoring organization</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="Production Infrastructure" />
                          </div>
                          <div className="space-y-2">
                            <Label>Organization ID</Label>
                            <Input defaultValue="org-prod-12345" readOnly className="font-mono" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Region</Label>
                            <Select defaultValue="us-west-2">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                                <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
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
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize your monitoring dashboard</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Refresh Dashboard</Label>
                            <p className="text-sm text-gray-500">Automatically refresh data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                            <Label>Default Time Range</Label>
                            <Select defaultValue="1h">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15m">Last 15 minutes</SelectItem>
                                <SelectItem value="1h">Last 1 hour</SelectItem>
                                <SelectItem value="4h">Last 4 hours</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Metric Annotations</Label>
                            <p className="text-sm text-gray-500">Display events on charts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Agents Settings */}
                {settingsTab === 'agents' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Agent Configuration</CardTitle>
                        <CardDescription>Global agent settings and defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Agent Version (Target)</Label>
                            <Select defaultValue="7.45.0">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7.45.0">7.45.0 (Latest)</SelectItem>
                                <SelectItem value="7.44.1">7.44.1</SelectItem>
                                <SelectItem value="7.43.0">7.43.0</SelectItem>
                                <SelectItem value="7.42.0">7.42.0</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Collection Interval</Label>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="15">15 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">60 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Update Agents</Label>
                            <p className="text-sm text-gray-500">Automatically update to latest version</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Log Collection</Label>
                            <p className="text-sm text-gray-500">Collect and forward application logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Process Monitoring</Label>
                            <p className="text-sm text-gray-500">Monitor running processes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Container Monitoring</Label>
                            <p className="text-sm text-gray-500">Monitor Docker/Kubernetes containers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>Manage agent authentication keys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="dd_api_xxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => {
                              navigator.clipboard.writeText('dd_api_xxxxxxxxxxxxxxxxxx')
                              toast.success('API Key copied to clipboard')
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => {
                              toast.info('Regenerating API key...')
                            }}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Application Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="dd_app_xxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => {
                              navigator.clipboard.writeText('dd_app_xxxxxxxxxxxxxxxxxx')
                              toast.success('Application Key copied to clipboard')
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Channels</CardTitle>
                        <CardDescription>Configure notification delivery channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Slack #alerts', type: 'Slack', enabled: true },
                          { name: 'Slack #oncall', type: 'Slack', enabled: true },
                          { name: 'PagerDuty', type: 'PagerDuty', enabled: true },
                          { name: 'ops@company.com', type: 'Email', enabled: true },
                          { name: 'Webhook (Internal)', type: 'Webhook', enabled: false }
                        ].map((channel) => (
                          <div key={channel.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {channel.type === 'Slack' && <Bell className="w-4 h-4" />}
                                {channel.type === 'PagerDuty' && <AlertCircle className="w-4 h-4" />}
                                {channel.type === 'Email' && <Mail className="w-4 h-4" />}
                                {channel.type === 'Webhook' && <Webhook className="w-4 h-4" />}
                              </div>
                              <div>
                                <span className="font-medium">{channel.name}</span>
                                <p className="text-xs text-gray-500">{channel.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked={channel.enabled} />
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedChannel(channel.name)
                                setShowConfigureChannelDialog(true)
                              }}>Configure</Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddChannelDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Channel
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Policies</CardTitle>
                        <CardDescription>Configure alert escalation rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Escalation</Label>
                            <p className="text-sm text-gray-500">Escalate unacknowledged alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>First Escalation</Label>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">After 5 minutes</SelectItem>
                                <SelectItem value="15">After 15 minutes</SelectItem>
                                <SelectItem value="30">After 30 minutes</SelectItem>
                                <SelectItem value="60">After 1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Second Escalation</Label>
                            <Select defaultValue="60">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">After 30 minutes</SelectItem>
                                <SelectItem value="60">After 1 hour</SelectItem>
                                <SelectItem value="120">After 2 hours</SelectItem>
                                <SelectItem value="240">After 4 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>Suppress non-critical alerts during specified times</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Quiet Hours</Label>
                            <p className="text-sm text-gray-500">Suppress low/medium alerts</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Thresholds Settings */}
                {settingsTab === 'thresholds' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>CPU Thresholds</CardTitle>
                        <CardDescription>Configure CPU usage alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-600">Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="70" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-600">High</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="85" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-red-600">Critical</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="95" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Evaluation Window</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 minute average</SelectItem>
                              <SelectItem value="5">5 minute average</SelectItem>
                              <SelectItem value="15">15 minute average</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Memory Thresholds</CardTitle>
                        <CardDescription>Configure memory usage alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-600">Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="75" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-600">High</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="85" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-red-600">Critical</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="95" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Disk Thresholds</CardTitle>
                        <CardDescription>Configure disk usage alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-600">Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="70" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-600">High</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="80" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-red-600">Critical</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="90" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Network Thresholds</CardTitle>
                        <CardDescription>Configure network alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Packet Loss Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="1" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Latency Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="100" className="w-20" />
                              <span className="text-gray-500">ms</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Integrations</CardTitle>
                        <CardDescription>Connect cloud providers for enhanced monitoring</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { name: 'AWS', connected: true, description: 'EC2, RDS, S3, Lambda metrics' },
                            { name: 'Google Cloud', connected: false, description: 'GCE, Cloud SQL, GKE metrics' },
                            { name: 'Azure', connected: false, description: 'VMs, SQL Database, AKS metrics' },
                            { name: 'DigitalOcean', connected: true, description: 'Droplets, Kubernetes metrics' }
                          ].map((integration) => (
                            <div key={integration.name} className="p-4 rounded-lg border dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{integration.name}</span>
                                <Badge variant={integration.connected ? 'default' : 'outline'}>
                                  {integration.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">{integration.description}</p>
                              <Button variant="outline" size="sm" className="w-full" onClick={() => {
                                setSelectedIntegration(integration.name)
                                setShowCloudIntegrationDialog(true)
                              }}>
                                {integration.connected ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Database Integrations</CardTitle>
                        <CardDescription>Connect databases for query performance monitoring</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'PostgreSQL', connected: true, hosts: 2 },
                          { name: 'MySQL', connected: false, hosts: 0 },
                          { name: 'MongoDB', connected: true, hosts: 1 },
                          { name: 'Redis', connected: true, hosts: 3 },
                          { name: 'Elasticsearch', connected: false, hosts: 0 }
                        ].map((db) => (
                          <div key={db.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <Database className="w-5 h-5 text-gray-500" />
                              <div>
                                <span className="font-medium">{db.name}</span>
                                {db.connected && <span className="text-xs text-gray-500 ml-2">{db.hosts} hosts</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {db.connected ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Connected
                                </Badge>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedIntegration(db.name)
                                  setShowDatabaseIntegrationDialog(true)
                                }}>Connect</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Container Orchestration</CardTitle>
                        <CardDescription>Connect container platforms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Kubernetes', connected: true, clusters: 3 },
                          { name: 'Docker Swarm', connected: false, clusters: 0 },
                          { name: 'ECS', connected: true, clusters: 1 }
                        ].map((platform) => (
                          <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <Container className="w-5 h-5 text-gray-500" />
                              <div>
                                <span className="font-medium">{platform.name}</span>
                                {platform.connected && <span className="text-xs text-gray-500 ml-2">{platform.clusters} clusters</span>}
                              </div>
                            </div>
                            <Badge className={platform.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {platform.connected ? 'Connected' : 'Not Connected'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Configure data retention policies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Metrics Retention</Label>
                            <Select defaultValue="15m">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3m">3 months</SelectItem>
                                <SelectItem value="6m">6 months</SelectItem>
                                <SelectItem value="15m">15 months</SelectItem>
                                <SelectItem value="2y">2 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Logs Retention</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">7 days</SelectItem>
                                <SelectItem value="15d">15 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                                <SelectItem value="90d">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Traces Retention</Label>
                            <Select defaultValue="15d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">7 days</SelectItem>
                                <SelectItem value="15d">15 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Events Retention</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15d">15 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                                <SelectItem value="90d">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Configure security settings</CardDescription>
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
                            <p className="text-sm text-gray-500">Restrict access by IP address</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SSO Only</Label>
                            <p className="text-sm text-gray-500">Require SSO authentication</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all user actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Features</CardTitle>
                        <CardDescription>Enable experimental features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>AI-Powered Anomaly Detection</Label>
                            <p className="text-sm text-gray-500">ML-based anomaly detection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Predictive Alerting</Label>
                            <p className="text-sm text-gray-500">Alert before thresholds are breached</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Debug Mode</Label>
                            <p className="text-sm text-gray-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Reset All Alerts</div>
                            <p className="text-sm text-gray-500">Clear all alert history</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowResetAlertsDialog(true)}>
                            Reset Alerts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Remove All Hosts</div>
                            <p className="text-sm text-gray-500">Unregister all monitored hosts</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowRemoveHostsDialog(true)}>
                            Remove Hosts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Delete Organization</div>
                            <p className="text-sm text-gray-500">Permanently delete this organization</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowDeleteOrgDialog(true)}>
                            Delete Organization
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockMonitoringAIInsights}
              title="Monitoring Intelligence"
              onInsightAction={(insight) => toast.info(insight.title`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMonitoringCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMonitoringPredictions}
              title="Infrastructure Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMonitoringActivities}
            title="Monitoring Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={monitoringQuickActions}
            variant="grid"
          />
        </div>

        {/* Host Detail Dialog */}
        <Dialog open={!!selectedHost} onOpenChange={() => setSelectedHost(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Server className="w-5 h-5" />
                {selectedHost?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedHost?.hostname} • {selectedHost?.ip_address}
              </DialogDescription>
            </DialogHeader>
            {selectedHost && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className={getHostStatusColor(selectedHost.status)}>{selectedHost.status}</Badge>
                  <Badge variant="outline">{selectedHost.instance_type}</Badge>
                  <Badge variant="outline">{selectedHost.os}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 border rounded-lg text-center">
                    <Cpu className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className={`text-2xl font-bold ${getMetricColor(selectedHost.cpu_usage, 80)}`}>
                      {selectedHost.cpu_usage}%
                    </p>
                    <p className="text-xs text-gray-500">CPU</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <MemoryStick className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className={`text-2xl font-bold ${getMetricColor(selectedHost.memory_usage, 80)}`}>
                      {selectedHost.memory_usage}%
                    </p>
                    <p className="text-xs text-gray-500">Memory</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <HardDrive className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className={`text-2xl font-bold ${getMetricColor(selectedHost.disk_usage, 80)}`}>
                      {selectedHost.disk_usage}%
                    </p>
                    <p className="text-xs text-gray-500">Disk</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{selectedHost.load_avg.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Load</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Region / AZ</p>
                    <p className="font-medium">{selectedHost.region} / {selectedHost.availability_zone}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Uptime</p>
                    <p className="font-medium">{formatUptime(selectedHost.uptime_seconds)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Processes</p>
                    <p className="font-medium">{selectedHost.processes}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Containers</p>
                    <p className="font-medium">{selectedHost.containers}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedHost.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => setShowSSHDialog(true)}>
                    <Terminal className="w-4 h-4 mr-2" />
                    SSH
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowHostMetricsDialog(true)}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Metrics
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowHostLogsDialog(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Logs
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Server Dialog */}
        <Dialog open={showAddServerDialog} onOpenChange={setShowAddServerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Server</DialogTitle>
              <DialogDescription>Register a new server for monitoring</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="server_name">Server Name *</Label>
                <Input
                  id="server_name"
                  placeholder="e.g., web-prod-01"
                  value={serverForm.server_name}
                  onChange={(e) => setServerForm(prev => ({ ...prev, server_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="server_type">Server Type</Label>
                <Select
                  value={serverForm.server_type}
                  onValueChange={(value) => setServerForm(prev => ({ ...prev, server_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="cache">Cache</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., us-west-2"
                    value={serverForm.location}
                    onChange={(e) => setServerForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip_address">IP Address</Label>
                  <Input
                    id="ip_address"
                    placeholder="e.g., 10.0.1.101"
                    value={serverForm.ip_address}
                    onChange={(e) => setServerForm(prev => ({ ...prev, ip_address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., env:production, team:platform"
                  value={serverForm.tags}
                  onChange={(e) => setServerForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddServerDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateServer} disabled={isLoading || !serverForm.server_name}>
                {isLoading ? 'Adding...' : 'Add Server'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Alert Dialog */}
        <Dialog open={showAddAlertDialog} onOpenChange={setShowAddAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
              <DialogDescription>Set up a new monitoring alert</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alert_title">Alert Title *</Label>
                <Input
                  id="alert_title"
                  placeholder="e.g., High CPU Usage"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alert_type">Alert Type</Label>
                  <Select
                    value={alertForm.alert_type}
                    onValueChange={(value) => setAlertForm(prev => ({ ...prev, alert_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu_high">CPU High</SelectItem>
                      <SelectItem value="memory_high">Memory High</SelectItem>
                      <SelectItem value="disk_full">Disk Full</SelectItem>
                      <SelectItem value="network_issue">Network Issue</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={alertForm.severity}
                    onValueChange={(value) => setAlertForm(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="server_select">Associated Server (optional)</Label>
                <Select
                  value={alertForm.server_id}
                  onValueChange={(value) => setAlertForm(prev => ({ ...prev, server_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {dbServers.map(server => (
                      <SelectItem key={server.id} value={server.id}>{server.server_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Alert description"
                  value={alertForm.description}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddAlertDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAlert} disabled={isLoading || !alertForm.title}>
                {isLoading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dashboards Dialog */}
        <Dialog open={showDashboardsDialog} onOpenChange={setShowDashboardsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboards
              </DialogTitle>
              <DialogDescription>View and manage your monitoring dashboards</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {mockDashboards.map(dashboard => (
                  <div key={dashboard.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{dashboard.name}</span>
                      {dashboard.is_shared && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{dashboard.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{dashboard.widgets_count} widgets</span>
                      <span>by {dashboard.created_by}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => {
                setShowDashboardsDialog(false)
                setShowCreateDashboardDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Dashboard
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowDashboardsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Overview Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alerts Overview
              </DialogTitle>
              <DialogDescription>View active and recent alerts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge className="bg-red-100 text-red-800">
                    {mockAlerts.filter(a => a.status === 'triggered').length} Triggered
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {mockAlerts.filter(a => a.status === 'acknowledged').length} Acknowledged
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {mockAlerts.filter(a => a.status === 'resolved').length} Resolved
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <span className="font-medium">{alert.title}</span>
                      <Badge className={getAlertSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      <Badge className={getAlertStatusColor(alert.status)}>{alert.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{alert.message}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => {
                setShowAlertsDialog(false)
                setShowAddAlertDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Alert Rule
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Metrics Dialog */}
        <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Metrics
              </DialogTitle>
              <DialogDescription>Real-time infrastructure metrics overview</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">CPU Usage</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{stats.avgCpu}%</p>
                  <p className="text-sm text-gray-500">Average across {stats.total} hosts</p>
                  <Progress value={stats.avgCpu} className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MemoryStick className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Memory Usage</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgMemory}%</p>
                  <p className="text-sm text-gray-500">Average across {stats.total} hosts</p>
                  <Progress value={stats.avgMemory} className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Host Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">{stats.healthy}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-yellow-600 font-bold">{stats.warning}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-red-600 font-bold">{stats.critical}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Healthy / Warning / Critical</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Container className="w-5 h-5 text-teal-500" />
                    <span className="font-medium">Containers</span>
                  </div>
                  <p className="text-3xl font-bold text-teal-600">{stats.totalContainers}</p>
                  <p className="text-sm text-gray-500">Running containers</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleRefreshMetrics} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Metrics
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowMetricsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Log Filters
              </DialogTitle>
              <DialogDescription>Configure log stream filters</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Log Level</Label>
                <Select defaultValue="all">
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
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="redis-cluster">redis-cluster</SelectItem>
                    <SelectItem value="api-gateway">api-gateway</SelectItem>
                    <SelectItem value="user-service">user-service</SelectItem>
                    <SelectItem value="worker-queue">worker-queue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select defaultValue="1h">
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
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Filters applied')
                setShowFilterDialog(false)
              }}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Channel Dialog */}
        <Dialog open={showConfigureChannelDialog} onOpenChange={setShowConfigureChannelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedChannel}</DialogTitle>
              <DialogDescription>Update notification channel settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input defaultValue={selectedChannel || ''} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Channel</Label>
                  <p className="text-sm text-gray-500">Send notifications to this channel</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Critical Alerts Only</Label>
                  <p className="text-sm text-gray-500">Only send critical severity alerts</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfigureChannelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Channel configuration updated')
                setShowConfigureChannelDialog(false)
              }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Channel Dialog */}
        <Dialog open={showAddChannelDialog} onOpenChange={setShowAddChannelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Notification Channel
              </DialogTitle>
              <DialogDescription>Configure a new notification channel</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel Type</Label>
                <Select defaultValue="slack">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="pagerduty">PagerDuty</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input placeholder="e.g., #alerts or ops@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Webhook URL / API Key</Label>
                <Input placeholder="Enter webhook URL or API key" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddChannelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Notification channel added')
                setShowAddChannelDialog(false)
              }}>Add Channel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cloud Integration Dialog */}
        <Dialog open={showCloudIntegrationDialog} onOpenChange={setShowCloudIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration}</DialogTitle>
              <DialogDescription>Set up cloud provider integration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Access Key ID</Label>
                <Input placeholder="Enter access key ID" type="password" />
              </div>
              <div className="space-y-2">
                <Label>Secret Access Key</Label>
                <Input placeholder="Enter secret access key" type="password" />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select defaultValue="us-west-2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-discover resources</Label>
                  <p className="text-sm text-gray-500">Automatically find and monitor resources</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCloudIntegrationDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Cloud integration configured')
                setShowCloudIntegrationDialog(false)
              }}>Connect</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Database Integration Dialog */}
        <Dialog open={showDatabaseIntegrationDialog} onOpenChange={setShowDatabaseIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {selectedIntegration}</DialogTitle>
              <DialogDescription>Set up database monitoring</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Host</Label>
                  <Input placeholder="localhost" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input placeholder="5432" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Database Name</Label>
                <Input placeholder="mydb" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input placeholder="admin" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input placeholder="password" type="password" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SSL/TLS</Label>
                  <p className="text-sm text-gray-500">Use encrypted connection</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDatabaseIntegrationDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Database connected')
                setShowDatabaseIntegrationDialog(false)
              }}>Connect</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Alerts Dialog */}
        <Dialog open={showResetAlertsDialog} onOpenChange={setShowResetAlertsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Reset All Alerts
              </DialogTitle>
              <DialogDescription>This action cannot be undone. All alert history will be permanently deleted.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will clear all {mockAlerts.length} alerts from the system. Are you sure you want to continue?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResetAlertsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('All alerts have been reset')
                setShowResetAlertsDialog(false)
              }}>Reset All Alerts</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Hosts Dialog */}
        <Dialog open={showRemoveHostsDialog} onOpenChange={setShowRemoveHostsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Remove All Hosts
              </DialogTitle>
              <DialogDescription>This action cannot be undone. All monitored hosts will be unregistered.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will remove all {stats.total} hosts from monitoring. You will need to re-register them to resume monitoring.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRemoveHostsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('All hosts have been removed')
                setShowRemoveHostsDialog(false)
              }}>Remove All Hosts</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Organization Dialog */}
        <Dialog open={showDeleteOrgDialog} onOpenChange={setShowDeleteOrgDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Delete Organization
              </DialogTitle>
              <DialogDescription>This action is permanent and cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Deleting this organization will permanently remove:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>All {stats.total} monitored hosts</li>
                <li>All alert configurations and history</li>
                <li>All dashboards and widgets</li>
                <li>All API keys and integrations</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteOrgDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.error('Organization deleted')
                setShowDeleteOrgDialog(false)
              }}>Delete Organization</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* SSH Dialog */}
        <Dialog open={showSSHDialog} onOpenChange={setShowSSHDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                SSH to {selectedHost?.name}
              </DialogTitle>
              <DialogDescription>Establish secure shell connection</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <p>$ ssh -i ~/.ssh/id_rsa ubuntu@{selectedHost?.ip_address}</p>
                <p className="text-gray-500 mt-2"># Connecting to {selectedHost?.hostname}...</p>
                <p className="text-gray-500"># Instance: {selectedHost?.instance_type}</p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Click below to copy the SSH command to your clipboard.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSSHDialog(false)}>Close</Button>
              <Button onClick={() => {
                navigator.clipboard.writeText(`ssh -i ~/.ssh/id_rsa ubuntu@${selectedHost?.ip_address}`)
                toast.success('SSH command copied to clipboard')
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Command
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Host Metrics Dialog */}
        <Dialog open={showHostMetricsDialog} onOpenChange={setShowHostMetricsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Metrics for {selectedHost?.name}
              </DialogTitle>
              <DialogDescription>Real-time performance metrics</DialogDescription>
            </DialogHeader>
            {selectedHost && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">CPU</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedHost.cpu_usage}%</p>
                    <Progress value={selectedHost.cpu_usage} className="mt-2" />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MemoryStick className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Memory</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedHost.memory_usage}%</p>
                    <Progress value={selectedHost.memory_usage} className="mt-2" />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Disk</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedHost.disk_usage}%</p>
                    <Progress value={selectedHost.disk_usage} className="mt-2" />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Load Average</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedHost.load_avg.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedHost.processes} processes</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Network In</p>
                    <p className="font-medium">{selectedHost.network_in} MB/s</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Network Out</p>
                    <p className="font-medium">{selectedHost.network_out} MB/s</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowHostMetricsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Host Logs Dialog */}
        <Dialog open={showHostLogsDialog} onOpenChange={setShowHostLogsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Logs for {selectedHost?.name}
              </DialogTitle>
              <DialogDescription>Recent log entries from this host</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
              {mockLogs.filter(log => selectedHost?.name && log.host.includes(selectedHost.name.split('-')[0])).length > 0 ? (
                mockLogs.filter(log => selectedHost?.name && log.host.includes(selectedHost.name.split('-')[0])).map(log => (
                  <div key={log.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs">
                    <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <Badge className={`ml-2 ${getLogLevelColor(log.level)}`}>{log.level.toUpperCase()}</Badge>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{log.message}</span>
                  </div>
                ))
              ) : (
                mockLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-xs">
                    <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <Badge className={`ml-2 ${getLogLevelColor(log.level)}`}>{log.level.toUpperCase()}</Badge>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowHostLogsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Dashboard Dialog */}
        <Dialog open={showCreateDashboardDialog} onOpenChange={setShowCreateDashboardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Create Dashboard
              </DialogTitle>
              <DialogDescription>Set up a new monitoring dashboard</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Dashboard Name</Label>
                <Input placeholder="e.g., Production Overview" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Describe what this dashboard monitors" />
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select defaultValue="blank">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blank">Blank Dashboard</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure Overview</SelectItem>
                    <SelectItem value="apm">APM Performance</SelectItem>
                    <SelectItem value="database">Database Metrics</SelectItem>
                    <SelectItem value="container">Container Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share with team</Label>
                  <p className="text-sm text-gray-500">Allow team members to view and edit</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDashboardDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Dashboard created')
                setShowCreateDashboardDialog(false)
              }}>Create Dashboard</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
