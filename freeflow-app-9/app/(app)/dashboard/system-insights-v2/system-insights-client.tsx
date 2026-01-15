'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
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
  Activity, AlertTriangle, Server, Cpu, HardDrive, TrendingUp, RefreshCw, Settings, Search,
  Bell, Layers, Zap, GitBranch, Box, Globe,
  FileText, BarChart3, ArrowUpRight, ArrowDownRight, CheckCircle,
  AlertCircle, Play, Pause, Download,
  Plus, Trash2, Edit3, Copy, ExternalLink, Mail, Webhook,
  Key, Sliders, Archive, AlertOctagon
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

// Enhanced System Insights Mock Data
const mockSystemInsightsAIInsights = [
  { id: '1', type: 'success' as const, title: 'System Health', description: 'All 12 services running optimally. 99.97% uptime this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'info' as const, title: 'Performance Trend', description: 'API latency improved 15% after recent optimization.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '3', type: 'warning' as const, title: 'Resource Alert', description: 'Database CPU at 78%. Consider scaling before peak hours.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Resources' },
]

const mockSystemInsightsCollaborators = [
  { id: '1', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Infrastructure', lastActive: 'Now' },
  { id: '2', name: 'SRE Engineer', avatar: '/avatars/sre.jpg', status: 'online' as const, role: 'Reliability', lastActive: '5m ago' },
  { id: '3', name: 'Platform Eng', avatar: '/avatars/platform.jpg', status: 'away' as const, role: 'Platform', lastActive: '15m ago' },
]

const mockSystemInsightsPredictions = [
  { id: '1', label: 'Uptime', current: 99.97, target: 99.99, predicted: 99.98, confidence: 92, trend: 'up' as const },
  { id: '2', label: 'Avg Latency', current: 145, target: 100, predicted: 125, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Error Rate', current: 0.12, target: 0.05, predicted: 0.08, confidence: 85, trend: 'up' as const },
]

const mockSystemInsightsActivities = [
  { id: '1', user: 'DevOps Lead', action: 'deployed', target: 'v2.4.1 to production', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'SRE Engineer', action: 'resolved', target: 'memory leak in auth-service', timestamp: '45m ago', type: 'info' as const },
  { id: '3', user: 'Platform Eng', action: 'scaled', target: 'API cluster to 8 nodes', timestamp: '2h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to use state setters

// Database types
interface DbSystemAlert {
  id: string
  user_id: string
  name: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  status: 'firing' | 'pending' | 'resolved' | 'muted'
  message: string
  metric: string
  value: number
  threshold: number
  tags: Record<string, string>
  created_at: string
  resolved_at?: string
}

interface DbSystemSettings {
  id: string
  user_id: string
  environment_name: string
  environment_type: string
  timezone: string
  default_dashboard: string
  dark_mode: boolean
  auto_refresh_interval: number
  compact_view: boolean
  show_sparklines: boolean
  relative_timestamps: boolean
  updated_at: string
}

export default function SystemInsightsClient() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('1h')
  const [logLevel, setLogLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase state
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbAlerts, setDbAlerts] = useState<DbSystemAlert[]>([])
  const [dbSettings, setDbSettings] = useState<DbSystemSettings | null>(null)
  const [showCreateAlertDialog, setShowCreateAlertDialog] = useState(false)

  // Quick action dialog states
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showMetricsDialog, setShowMetricsDialog] = useState(false)

  // Additional dialog states for buttons without handlers
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [showEditNotificationDialog, setShowEditNotificationDialog] = useState(false)
  const [showAddNotificationDialog, setShowAddNotificationDialog] = useState(false)
  const [showEditEscalationDialog, setShowEditEscalationDialog] = useState(false)
  const [showAddEscalationDialog, setShowAddEscalationDialog] = useState(false)
  const [showCloudProviderDialog, setShowCloudProviderDialog] = useState(false)
  const [showContainerPlatformDialog, setShowContainerPlatformDialog] = useState(false)
  const [showAPMAgentDialog, setShowAPMAgentDialog] = useState(false)
  const [showEditWebhookDialog, setShowEditWebhookDialog] = useState(false)
  const [showDeleteWebhookDialog, setShowDeleteWebhookDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showCopyApiKeyDialog, setShowCopyApiKeyDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showGenerateNewKeyDialog, setShowGenerateNewKeyDialog] = useState(false)
  const [showDeleteApiKeyDialog, setShowDeleteApiKeyDialog] = useState(false)
  const [showPurgeDataDialog, setShowPurgeDataDialog] = useState(false)
  const [showResetEnvironmentDialog, setShowResetEnvironmentDialog] = useState(false)
  const [showExportMetricsDialog, setShowExportMetricsDialog] = useState(false)
  const [showRefreshMetricsDialog, setShowRefreshMetricsDialog] = useState(false)
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false)

  // Selected item states for editing
  const [selectedNotificationChannel, setSelectedNotificationChannel] = useState<{ name: string; icon: typeof Mail; config: string; enabled: boolean } | null>(null)
  const [selectedEscalationPolicy, setSelectedEscalationPolicy] = useState<{ tier: string; team: string; delay: string; channels: string[] } | null>(null)
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<{ name: string; status: string; lastSync: string | null } | null>(null)
  const [selectedContainerPlatform, setSelectedContainerPlatform] = useState<{ name: string; status: string; clusters: number } | null>(null)
  const [selectedAPMAgent, setSelectedAPMAgent] = useState<{ language: string; version: string; services: number } | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<{ name: string; url: string; events: string[] } | null>(null)
  const [selectedApiKey, setSelectedApiKey] = useState<{ name: string; lastUsed: string; permissions: string } | null>(null)

  // Form states for new items
  const [notificationForm, setNotificationForm] = useState({ name: '', config: '', enabled: true })
  const [escalationForm, setEscalationForm] = useState({ tier: '', team: '', delay: '15 min', channels: ['Email'] })
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: ['alerts'] })
  const [apiKeyForm, setApiKeyForm] = useState({ name: '', permissions: 'Read' })

  // Quick actions with proper dialog handlers
  const systemInsightsQuickActions = [
    { id: '1', label: 'Deploy', icon: 'Rocket', shortcut: 'D', action: () => setShowDeployDialog(true) },
    { id: '2', label: 'Restart', icon: 'RefreshCw', shortcut: 'R', action: () => setShowRestartDialog(true) },
    { id: '3', label: 'Logs', icon: 'Terminal', shortcut: 'L', action: () => setShowLogsDialog(true) },
    { id: '4', label: 'Metrics', icon: 'BarChart3', shortcut: 'M', action: () => setShowMetricsDialog(true) },
  ]

  // Form state for creating alerts
  const [alertForm, setAlertForm] = useState({
    name: '',
    severity: 'warning' as 'info' | 'warning' | 'error' | 'critical',
    message: '',
    metric: '',
    threshold: 0
  })

  // Form state for settings
  const [settingsForm, setSettingsForm] = useState({
    environment_name: 'Production',
    environment_type: 'production',
    timezone: 'utc',
    default_dashboard: 'overview',
    dark_mode: true,
    auto_refresh_interval: 30,
    compact_view: false,
    show_sparklines: true,
    relative_timestamps: true
  })

  // Fetch alerts from Supabase
  const fetchAlerts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }, [supabase])

  // Fetch settings from Supabase
  const fetchSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setDbSettings(data)
        setSettingsForm({
          environment_name: data.environment_name || 'Production',
          environment_type: data.environment_type || 'production',
          timezone: data.timezone || 'utc',
          default_dashboard: data.default_dashboard || 'overview',
          dark_mode: data.dark_mode ?? true,
          auto_refresh_interval: data.auto_refresh_interval || 30,
          compact_view: data.compact_view ?? false,
          show_sparklines: data.show_sparklines ?? true,
          relative_timestamps: data.relative_timestamps ?? true
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAlerts()
    fetchSettings()
  }, [fetchAlerts, fetchSettings])

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

  // Handlers
  const handleRefreshMetrics = async () => {
    setLoading(true)
    toast.promise(
      Promise.all([fetchAlerts(), fetchSettings()]).finally(() => setLoading(false)),
      {
        loading: 'Refreshing metrics...',
        success: 'Data refreshed successfully',
        error: 'Failed to refresh metrics'
      }
    )
  }

  const handleCreateAlert = async () => {
    if (!alertForm.name.trim() || !alertForm.message.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('system_alerts').insert({
        user_id: user.id,
        name: alertForm.name,
        severity: alertForm.severity,
        status: 'pending',
        message: alertForm.message,
        metric: alertForm.metric || 'custom',
        value: 0,
        threshold: alertForm.threshold,
        tags: {}
      })

      if (error) throw error
      toast.success('Alert created', { description: 'You will be notified of anomalies' })
      setShowCreateAlertDialog(false)
      setAlertForm({ name: '', severity: 'warning', message: '', metric: '', threshold: 0 })
      await fetchAlerts()
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create alert')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateAlertStatus = async (alertId: string, newStatus: 'firing' | 'pending' | 'resolved' | 'muted') => {
    try {
      const updateData: Partial<DbSystemAlert> = { status: newStatus }
      if (newStatus === 'resolved') updateData.resolved_at = new Date().toISOString()

      const { error } = await supabase
        .from('system_alerts')
        .update(updateData)
        .eq('id', alertId)

      if (error) throw error
      toast.success(`Alert ${newStatus}`)
      await fetchAlerts()
    } catch (error) {
      console.error('Error updating alert:', error)
      toast.error('Failed to update alert')
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase.from('system_alerts').delete().eq('id', alertId)
      if (error) throw error
      toast.success('Alert deleted')
      await fetchAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error('Failed to delete alert')
    }
  }

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const settingsData = {
        user_id: user.id,
        ...settingsForm,
        updated_at: new Date().toISOString()
      }

      if (dbSettings) {
        const { error } = await supabase
          .from('system_settings')
          .update(settingsData)
          .eq('id', dbSettings.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('system_settings').insert(settingsData)
        if (error) throw error
      }

      toast.success('Settings saved')
      await fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportReport = async () => {
    const exportPromise = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Log export activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'export_report',
        resource_type: 'system_insights',
        metadata: { timeRange, exportedAt: new Date().toISOString() }
      })
    }

    toast.promise(exportPromise(), {
      loading: 'Preparing export...',
      success: 'Report exported successfully',
      error: 'Failed to export report'
    })
  }

  const handleClearAllAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('system_alerts')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('All alerts cleared')
      await fetchAlerts()
    } catch (error) {
      console.error('Error clearing alerts:', error)
      toast.error('Failed to clear alerts')
    }
  }

  const handleRestartService = (serviceName: string) => {
    toast.promise(
      fetch(`/api/system/services/${encodeURIComponent(serviceName)}/restart`, { method: 'POST' }).then(res => {
        if (!res.ok) throw new Error('Failed to restart service')
      }),
      {
        loading: `Restarting ${serviceName}...`,
        success: `${serviceName} restarted successfully`,
        error: `Failed to restart ${serviceName}`
      }
    )
  }

  const handleScaleService = (serviceName: string) => {
    toast.success(`Scaling options loaded for ${serviceName}`, { description: 'Configure scaling settings in the dialog' })
  }

  // Handler functions for buttons without onClick
  const handleExportLogs = async () => {
    setShowExportLogsDialog(false)
    toast.promise(
      fetch('/api/system/logs/export').then(res => {
        if (!res.ok) throw new Error('Export failed')
        return res.blob()
      }).then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `system-logs-${Date.now()}.zip`
        a.click()
        URL.revokeObjectURL(url)
      }),
      {
        loading: 'Exporting logs...',
        success: 'Logs exported successfully',
        error: 'Failed to export logs'
      }
    )
  }

  const handleSaveNotificationChannel = async () => {
    if (!notificationForm.name.trim()) {
      toast.error('Please enter a channel name')
      return
    }
    setShowAddNotificationDialog(false)
    toast.promise(
      fetch('/api/system/notifications/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationForm)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to add channel')
      }),
      {
        loading: 'Adding notification channel...',
        success: 'Notification channel added',
        error: 'Failed to add notification channel'
      }
    )
    setNotificationForm({ name: '', config: '', enabled: true })
  }

  const handleUpdateNotificationChannel = async () => {
    setShowEditNotificationDialog(false)
    toast.success('Notification channel updated')
    setSelectedNotificationChannel(null)
  }

  const handleSaveEscalationPolicy = async () => {
    if (!escalationForm.tier.trim() || !escalationForm.team.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    setShowAddEscalationDialog(false)
    toast.promise(
      fetch('/api/system/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(escalationForm)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to add escalation tier')
      }),
      {
        loading: 'Adding escalation tier...',
        success: 'Escalation tier added',
        error: 'Failed to add escalation tier'
      }
    )
    setEscalationForm({ tier: '', team: '', delay: '15 min', channels: ['Email'] })
  }

  const handleUpdateEscalationPolicy = async () => {
    setShowEditEscalationDialog(false)
    toast.success('Escalation policy updated')
    setSelectedEscalationPolicy(null)
  }

  const handleConnectCloudProvider = async () => {
    setShowCloudProviderDialog(false)
    toast.promise(
      fetch('/api/system/cloud/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedCloudProvider?.name })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to connect')
      }),
      {
        loading: `Connecting to ${selectedCloudProvider?.name}...`,
        success: `Connected to ${selectedCloudProvider?.name}`,
        error: `Failed to connect to ${selectedCloudProvider?.name}`
      }
    )
    setSelectedCloudProvider(null)
  }

  const handleConnectContainerPlatform = async () => {
    setShowContainerPlatformDialog(false)
    toast.promise(
      fetch('/api/system/containers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedContainerPlatform?.name })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to connect')
      }),
      {
        loading: `Connecting to ${selectedContainerPlatform?.name}...`,
        success: `Connected to ${selectedContainerPlatform?.name}`,
        error: `Failed to connect to ${selectedContainerPlatform?.name}`
      }
    )
    setSelectedContainerPlatform(null)
  }

  const handleViewAPMAgent = async () => {
    setShowAPMAgentDialog(false)
    window.open(`https://docs.kazi.app/apm/${selectedAPMAgent?.language?.toLowerCase()}`, '_blank')
    setSelectedAPMAgent(null)
  }

  const handleSaveWebhook = async () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    setShowAddWebhookDialog(false)
    toast.promise(
      fetch('/api/system/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookForm)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to add webhook')
      }),
      {
        loading: 'Adding webhook...',
        success: 'Webhook added successfully',
        error: 'Failed to add webhook'
      }
    )
    setWebhookForm({ name: '', url: '', events: ['alerts'] })
  }

  const handleUpdateWebhook = async () => {
    setShowEditWebhookDialog(false)
    toast.success('Webhook updated')
    setSelectedWebhook(null)
  }

  const handleDeleteWebhook = async () => {
    setShowDeleteWebhookDialog(false)
    toast.promise(
      fetch(`/api/system/webhooks/${selectedWebhook?.id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('Failed to delete webhook')
      }),
      {
        loading: 'Deleting webhook...',
        success: 'Webhook deleted',
        error: 'Failed to delete webhook'
      }
    )
    setSelectedWebhook(null)
  }

  const handleCopyApiKey = async () => {
    await navigator.clipboard.writeText('kazi-prod-xxxxxxxxxxxxxxxxxxxxx')
    setShowCopyApiKeyDialog(false)
    toast.success('API key copied to clipboard')
  }

  const handleRegenerateApiKey = async () => {
    setShowRegenerateApiKeyDialog(false)
    toast.promise(
      fetch('/api/system/api-keys/regenerate', { method: 'POST' }).then(res => {
        if (!res.ok) throw new Error('Failed to regenerate API key')
      }),
      {
        loading: 'Regenerating API key...',
        success: 'New API key generated. Please update your integrations.',
        error: 'Failed to regenerate API key'
      }
    )
  }

  const handleGenerateNewApiKey = async () => {
    if (!apiKeyForm.name.trim()) {
      toast.error('Please enter a key name')
      return
    }
    setShowGenerateNewKeyDialog(false)
    toast.promise(
      fetch('/api/system/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeyForm)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to generate API key')
      }),
      {
        loading: 'Generating new API key...',
        success: 'New API key generated',
        error: 'Failed to generate API key'
      }
    )
    setApiKeyForm({ name: '', permissions: 'Read' })
  }

  const handleDeleteApiKey = async () => {
    setShowDeleteApiKeyDialog(false)
    toast.promise(
      fetch(`/api/system/api-keys/${selectedApiKey?.id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('Failed to delete API key')
      }),
      {
        loading: 'Deleting API key...',
        success: 'API key deleted',
        error: 'Failed to delete API key'
      }
    )
    setSelectedApiKey(null)
  }

  const handleCopyInstallCommand = async () => {
    const command = `curl -sL https://install.kazi.app/agent | bash -s -- --api-key=KAZI-XXXXXXXX`
    await navigator.clipboard.writeText(command)
    toast.success('Installation command copied to clipboard')
  }

  const handleOpenDocumentation = () => {
    setShowDocumentationDialog(false)
    window.open('https://docs.kazi.app/agent-installation', '_blank')
  }

  const handlePurgeData = async () => {
    setShowPurgeDataDialog(false)
    toast.promise(
      fetch('/api/system/data/purge', { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('Failed to purge data')
      }),
      {
        loading: 'Purging all monitoring data...',
        success: 'All data has been purged',
        error: 'Failed to purge data'
      }
    )
  }

  const handleResetEnvironment = async () => {
    setShowResetEnvironmentDialog(false)
    toast.promise(
      fetch('/api/system/reset', { method: 'POST' }).then(res => {
        if (!res.ok) throw new Error('Failed to reset environment')
      }),
      {
        loading: 'Resetting environment...',
        success: 'Environment has been reset to defaults',
        error: 'Failed to reset environment'
      }
    )
  }

  const handleExportMetrics = async () => {
    setShowExportMetricsDialog(false)
    toast.promise(
      fetch('/api/system/metrics/export').then(res => {
        if (!res.ok) throw new Error('Export failed')
        return res.blob()
      }).then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `metrics-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      }),
      {
        loading: 'Exporting metrics...',
        success: 'Metrics exported successfully',
        error: 'Failed to export metrics'
      }
    )
  }

  const handleRefreshMetricsDashboard = () => {
    toast.promise(
      fetch('/api/system/metrics/refresh', { method: 'POST' }).then(res => {
        if (!res.ok) throw new Error('Failed to refresh metrics')
      }),
      {
        loading: 'Refreshing metrics...',
        success: 'Metrics refreshed',
        error: 'Failed to refresh metrics'
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
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
                <Button
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={handleRefreshMetrics}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
              <Dialog open={showCreateAlertDialog} onOpenChange={setShowCreateAlertDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Alert</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Alert Name *</Label>
                      <Input
                        value={alertForm.name}
                        onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
                        placeholder="e.g., High CPU Usage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select
                        value={alertForm.severity}
                        onValueChange={(v) => setAlertForm({ ...alertForm, severity: v as typeof alertForm.severity })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Input
                        value={alertForm.message}
                        onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                        placeholder="Alert condition description"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label>Metric</Label>
                        <Input
                          value={alertForm.metric}
                          onChange={(e) => setAlertForm({ ...alertForm, metric: e.target.value })}
                          placeholder="e.g., system.cpu.usage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Threshold</Label>
                        <Input
                          type="number"
                          value={alertForm.threshold}
                          onChange={(e) => setAlertForm({ ...alertForm, threshold: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateAlert} disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Creating...' : 'Create Alert'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Display DB alerts first, then mock alerts */}
            <div className="space-y-4">
              {dbAlerts.map(alert => (
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
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={alert.status}
                          onValueChange={(v) => handleUpdateAlertStatus(alert.id, v as typeof alert.status)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="firing">Firing</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="muted">Muted</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <Button variant="outline" onClick={() => setShowExportLogsDialog(true)}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
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

          {/* Settings Tab - New Relic Level Configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure monitoring platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'collection', label: 'Data Collection', icon: Activity },
                        { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
                        { id: 'retention', label: 'Data Retention', icon: Archive },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-slate-600 text-white'
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

                {/* System Health Sidebar */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Data Ingestion</span>
                        <span className="font-medium">2.4 GB/hr</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Storage Used</span>
                        <span className="font-medium">847 GB / 1 TB</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Active Agents</span>
                        <span className="font-medium">24 / 30</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Metrics/min</span>
                        <span className="font-medium text-emerald-600">145K</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Logs/min</span>
                        <span className="font-medium text-blue-600">89K</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Traces/min</span>
                        <span className="font-medium text-purple-600">12K</span>
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
                        <CardDescription>Basic configuration for your monitoring environment</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Environment Name</Label>
                            <Input
                              value={settingsForm.environment_name}
                              onChange={(e) => setSettingsForm({ ...settingsForm, environment_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Environment Type</Label>
                            <Select
                              value={settingsForm.environment_type}
                              onValueChange={(v) => setSettingsForm({ ...settingsForm, environment_type: v })}
                            >
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select
                              value={settingsForm.timezone}
                              onValueChange={(v) => setSettingsForm({ ...settingsForm, timezone: v })}
                            >
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
                            <Label>Default Dashboard</Label>
                            <Select
                              value={settingsForm.default_dashboard}
                              onValueChange={(v) => setSettingsForm({ ...settingsForm, default_dashboard: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                <SelectItem value="apm">APM</SelectItem>
                                <SelectItem value="logs">Logs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-4 border-t">
                          <div>
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-gray-500">Enable dark mode for the dashboard</p>
                          </div>
                          <Switch
                            checked={settingsForm.dark_mode}
                            onCheckedChange={(v) => setSettingsForm({ ...settingsForm, dark_mode: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-refresh</Label>
                            <p className="text-sm text-gray-500">Automatically refresh dashboard data</p>
                          </div>
                          <Select
                            value={String(settingsForm.auto_refresh_interval)}
                            onValueChange={(v) => setSettingsForm({ ...settingsForm, auto_refresh_interval: Number(v) })}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">Every 10s</SelectItem>
                              <SelectItem value="30">Every 30s</SelectItem>
                              <SelectItem value="60">Every 1m</SelectItem>
                              <SelectItem value="300">Every 5m</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSaveSettings} disabled={isSubmitting} className="w-full">
                          {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize how data is displayed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Compact View</Label>
                            <p className="text-sm text-gray-500">Use condensed layouts for more data</p>
                          </div>
                          <Switch
                            checked={settingsForm.compact_view}
                            onCheckedChange={(v) => setSettingsForm({ ...settingsForm, compact_view: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Sparklines</Label>
                            <p className="text-sm text-gray-500">Display mini charts in metric cards</p>
                          </div>
                          <Switch
                            checked={settingsForm.show_sparklines}
                            onCheckedChange={(v) => setSettingsForm({ ...settingsForm, show_sparklines: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Relative Timestamps</Label>
                            <p className="text-sm text-gray-500">Show "5 min ago" instead of exact time</p>
                          </div>
                          <Switch
                            checked={settingsForm.relative_timestamps}
                            onCheckedChange={(v) => setSettingsForm({ ...settingsForm, relative_timestamps: v })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Color-blind Mode</Label>
                            <p className="text-sm text-gray-500">Use accessible color palette</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Data Collection Settings */}
                {settingsTab === 'collection' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Infrastructure Metrics</CardTitle>
                        <CardDescription>Configure infrastructure data collection</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Infrastructure Monitoring</Label>
                            <p className="text-sm text-gray-500">Collect CPU, memory, disk, network metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Metric Collection Interval</Label>
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
                            <Label>Process Monitoring</Label>
                            <Select defaultValue="enabled">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enabled">Enabled</SelectItem>
                                <SelectItem value="top10">Top 10 only</SelectItem>
                                <SelectItem value="disabled">Disabled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Container Metrics</Label>
                            <p className="text-sm text-gray-500">Collect Docker/Kubernetes metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>APM & Traces</CardTitle>
                        <CardDescription>Application performance monitoring settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Distributed Tracing</Label>
                            <p className="text-sm text-gray-500">Track requests across services</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Trace Sampling Rate</Label>
                            <Select defaultValue="10">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1%</SelectItem>
                                <SelectItem value="10">10%</SelectItem>
                                <SelectItem value="50">50%</SelectItem>
                                <SelectItem value="100">100%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Error Trace Sampling</Label>
                            <Select defaultValue="100">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50%</SelectItem>
                                <SelectItem value="100">100% (Recommended)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SQL Query Analysis</Label>
                            <p className="text-sm text-gray-500">Capture and analyze database queries</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Code-level Insights</Label>
                            <p className="text-sm text-gray-500">Track performance at function level</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Log Collection</CardTitle>
                        <CardDescription>Configure log ingestion settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Log Collection</Label>
                            <p className="text-sm text-gray-500">Ingest application and system logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Minimum Log Level</Label>
                            <Select defaultValue="info">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="debug">Debug</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warn">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Log Size</Label>
                            <Select defaultValue="64">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="16">16 KB</SelectItem>
                                <SelectItem value="64">64 KB</SelectItem>
                                <SelectItem value="256">256 KB</SelectItem>
                                <SelectItem value="1024">1 MB</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Log Exclusion Patterns</Label>
                          <Input placeholder="e.g., /health, /metrics, debug:*" />
                          <p className="text-xs text-gray-500">Comma-separated patterns to exclude</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Real User Monitoring</CardTitle>
                        <CardDescription>Browser and mobile performance monitoring</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable RUM</Label>
                            <p className="text-sm text-gray-500">Track real user experience metrics</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Session Recording</Label>
                            <p className="text-sm text-gray-500">Record user sessions for replay</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Error Tracking</Label>
                            <p className="text-sm text-gray-500">Capture frontend JavaScript errors</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Alerts & Notifications */}
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
                          { name: 'Microsoft Teams', icon: Webhook, config: 'DevOps Team', enabled: false },
                          { name: 'Webhook', icon: Globe, config: 'https://hooks.example.com/alerts', enabled: false },
                          { name: 'SMS', icon: Bell, config: '+1 (555) 123-4567', enabled: false }
                        ].map((channel, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
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
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedNotificationChannel(channel)
                                setShowEditNotificationDialog(true)
                              }}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Switch defaultChecked={channel.enabled} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-4" onClick={() => setShowAddNotificationDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Notification Channel
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Policies</CardTitle>
                        <CardDescription>Configure alert severity and routing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Critical Alert Cooldown</Label>
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
                            <Label>Warning Alert Cooldown</Label>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-resolve Alerts</Label>
                            <p className="text-sm text-gray-500">Automatically resolve when condition clears</p>
                          </div>
                          <Switch defaultChecked />
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Policies</CardTitle>
                        <CardDescription>Configure multi-tier alert escalation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { tier: 'Tier 1', team: 'On-call Engineer', delay: 'Immediate', channels: ['PagerDuty', 'Slack'] },
                          { tier: 'Tier 2', team: 'Senior Engineer', delay: '15 min', channels: ['PagerDuty', 'SMS'] },
                          { tier: 'Tier 3', team: 'Engineering Lead', delay: '30 min', channels: ['PagerDuty', 'Phone'] }
                        ].map((policy, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{policy.tier}: {policy.team}</p>
                              <p className="text-sm text-gray-500">
                                After {policy.delay} → {policy.channels.join(', ')}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedEscalationPolicy(policy)
                              setShowEditEscalationDialog(true)
                            }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddEscalationDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Escalation Tier
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Data Retention */}
                {settingsTab === 'retention' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Retention Policies</CardTitle>
                        <CardDescription>Configure how long data is retained</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="h-5 w-5 text-blue-600" />
                              <Label className="text-base">Metrics</Label>
                            </div>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="15">15 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">~450 GB stored</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="h-5 w-5 text-amber-600" />
                              <Label className="text-base">Logs</Label>
                            </div>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="15">15 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">~280 GB stored</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <GitBranch className="h-5 w-5 text-purple-600" />
                              <Label className="text-base">Traces</Label>
                            </div>
                            <Select defaultValue="7">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="15">15 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">~85 GB stored</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Bell className="h-5 w-5 text-red-600" />
                              <Label className="text-base">Alerts/Events</Label>
                            </div>
                            <Select defaultValue="90">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">~32 GB stored</p>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <HardDrive className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300">Storage Usage</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                Total: 847 GB of 1 TB (84.7% used) • Projected: 920 GB in 30 days
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Archival</CardTitle>
                        <CardDescription>Configure long-term data storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Cold Storage Archival</Label>
                            <p className="text-sm text-gray-500">Archive old data to cheaper storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Archive Provider</Label>
                            <Select defaultValue="s3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="s3">AWS S3 Glacier</SelectItem>
                                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                                <SelectItem value="azure">Azure Blob Storage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Archive After</Label>
                            <Select defaultValue="90">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Compress Archived Data</Label>
                            <p className="text-sm text-gray-500">Reduce storage costs with compression</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Cleanup</CardTitle>
                        <CardDescription>Automatic data cleanup policies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-delete Orphaned Data</Label>
                            <p className="text-sm text-gray-500">Remove data from deleted hosts/services</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Remove Duplicate Traces</Label>
                            <p className="text-sm text-gray-500">Deduplicate similar trace data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Aggregate Old Metrics</Label>
                            <p className="text-sm text-gray-500">Downsample metrics older than 7 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations */}
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
                          { name: 'DigitalOcean', status: 'not_connected', lastSync: null }
                        ].map((provider, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${provider.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Server className={`h-4 w-4 ${provider.status === 'connected' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                {provider.lastSync && (
                                  <p className="text-sm text-gray-500">Last sync: {provider.lastSync}</p>
                                )}
                              </div>
                            </div>
                            <Button variant={provider.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={() => {
                              setSelectedCloudProvider(provider)
                              setShowCloudProviderDialog(true)
                            }}>
                              {provider.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Container Orchestration</CardTitle>
                        <CardDescription>Connect to container platforms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Kubernetes', status: 'connected', clusters: 3 },
                          { name: 'Docker Swarm', status: 'connected', clusters: 1 },
                          { name: 'Amazon ECS', status: 'not_connected', clusters: 0 },
                          { name: 'Nomad', status: 'not_connected', clusters: 0 }
                        ].map((platform, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${platform.status === 'connected' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Box className={`h-4 w-4 ${platform.status === 'connected' ? 'text-blue-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{platform.name}</p>
                                {platform.clusters > 0 && (
                                  <p className="text-sm text-gray-500">{platform.clusters} cluster(s) connected</p>
                                )}
                              </div>
                            </div>
                            <Button variant={platform.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={() => {
                              setSelectedContainerPlatform(platform)
                              setShowContainerPlatformDialog(true)
                            }}>
                              {platform.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>APM Agents</CardTitle>
                        <CardDescription>Application monitoring agents</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { language: 'Node.js', version: '2.4.1', services: 5 },
                          { language: 'Python', version: '3.1.0', services: 3 },
                          { language: 'Java', version: '1.8.2', services: 2 },
                          { language: 'Go', version: '1.5.0', services: 4 },
                          { language: 'Ruby', version: '2.0.1', services: 1 }
                        ].map((agent, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{agent.language}</Badge>
                              <span className="text-sm text-gray-500">v{agent.version}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">{agent.services} service(s)</span>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedAPMAgent(agent)
                                setShowAPMAgentDialog(true)
                              }}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Send data to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Incident Manager', url: 'https://incidents.example.com/hook', events: ['alerts'] },
                          { name: 'Metrics Pipeline', url: 'https://metrics.example.com/ingest', events: ['metrics'] }
                        ].map((webhook, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{webhook.name}</p>
                              <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedWebhook(webhook)
                                setShowEditWebhookDialog(true)
                              }}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                                setSelectedWebhook(webhook)
                                setShowDeleteWebhookDialog(true)
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
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
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and access tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="kazi-prod-xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={() => setShowCopyApiKeyDialog(true)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last used: 2 min ago</p>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between mb-4">
                            <Label>Additional API Keys</Label>
                            <Button variant="outline" size="sm" onClick={() => setShowGenerateNewKeyDialog(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Generate New Key
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {[
                              { name: 'CI/CD Pipeline', lastUsed: '1 hour ago', permissions: 'Write' },
                              { name: 'Dashboard Read', lastUsed: '5 min ago', permissions: 'Read' }
                            ].map((key, idx) => (
                              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Key className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium">{key.name}</p>
                                    <p className="text-xs text-gray-500">Last used: {key.lastUsed}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{key.permissions}</Badge>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                                    setSelectedApiKey(key)
                                    setShowDeleteApiKeyDialog(true)
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

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
                          <Button variant="outline" size="sm" onClick={handleCopyInstallCommand}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Command
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowDocumentationDialog(true)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Documentation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Export monitoring data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Export Type</Label>
                            <Select defaultValue="metrics">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="metrics">Metrics</SelectItem>
                                <SelectItem value="logs">Logs</SelectItem>
                                <SelectItem value="traces">Traces</SelectItem>
                                <SelectItem value="alerts">Alerts</SelectItem>
                                <SelectItem value="all">All Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Format</Label>
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                <SelectItem value="custom">Custom range</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Destination</Label>
                            <Select defaultValue="download">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="download">Download</SelectItem>
                                <SelectItem value="s3">AWS S3</SelectItem>
                                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleExportReport}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security & Compliance</CardTitle>
                        <CardDescription>Security settings and audit logs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Require 2FA for all team members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP Allowlist</Label>
                            <p className="text-sm text-gray-500">Restrict API access to specific IPs</p>
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
                            <Label>Data Encryption at Rest</Label>
                            <p className="text-sm text-gray-500">Encrypt stored monitoring data</p>
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
                        <CardDescription>Irreversible actions that affect your monitoring environment</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Clear All Alerts</p>
                            <p className="text-sm text-gray-500">Delete all alert history and notifications</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleClearAllAlerts}
                          >
                            Clear Alerts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Purge All Data</p>
                            <p className="text-sm text-gray-500">Delete all metrics, logs, and traces</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowPurgeDataDialog(true)}>
                            Purge Data
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Reset Environment</p>
                            <p className="text-sm text-gray-500">Reset all settings to defaults and remove all integrations</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowResetEnvironmentDialog(true)}>
                            Reset Environment
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
              insights={mockSystemInsightsAIInsights}
              title="System Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSystemInsightsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSystemInsightsPredictions}
              title="System Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSystemInsightsActivities}
            title="System Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={systemInsightsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Deploy Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy System</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <Label>Version/Tag</Label>
              <Input placeholder="e.g., v2.4.1 or latest" defaultValue="latest" />
            </div>
            <div className="space-y-2">
              <Label>Deploy Strategy</Label>
              <Select defaultValue="rolling">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rolling">Rolling Update</SelectItem>
                  <SelectItem value="bluegreen">Blue-Green</SelectItem>
                  <SelectItem value="canary">Canary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label>Run Pre-deploy Checks</Label>
                <p className="text-sm text-gray-500">Execute health checks before deployment</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeployDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Deployment initiated successfully')
                setShowDeployDialog(false)
              }}>
                Deploy Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restart Services Dialog */}
      <Dialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restart Services</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Services to Restart</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {mockServices.map(service => (
                  <div key={service.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={service.id} className="rounded" defaultChecked />
                      <label htmlFor={service.id} className="text-sm">{service.name}</label>
                    </div>
                    <Badge className={getStatusColor(service.status)} variant="outline">
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Restart Mode</Label>
              <Select defaultValue="graceful">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graceful">Graceful (drain connections)</SelectItem>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="rolling">Rolling (one at a time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowRestartDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Services restart initiated')
                setShowRestartDialog(false)
              }}>
                Restart Selected
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>System Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search logs..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {mockServices.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {mockLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2 py-1 text-gray-300">
                  <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <Badge className={`${getLogLevelColor(log.level)} text-xs`}>{log.level}</Badge>
                  <span className="text-cyan-400">[{log.service}]</span>
                  <span className="text-gray-300 flex-1">{log.message}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowLogsDialog(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Dashboard Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Metrics Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <Select defaultValue="1h">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Last 15 min</SelectItem>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Host" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hosts</SelectItem>
                  {mockHosts.map(h => (
                    <SelectItem key={h.id} value={h.name}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefreshMetricsDashboard}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {mockMetrics.slice(0, 4).map(metric => (
                <div key={metric.id} className={`p-4 rounded-lg ${
                  metric.status === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
                  metric.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                  'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</span>
                    <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                  <div className="flex items-end gap-1 h-12 mt-2">
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
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setShowMetricsDialog(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={handleExportMetrics}>
                <Download className="h-4 w-4 mr-2" />
                Export Metrics
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Logs Dialog */}
      <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="json">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
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
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Include metadata</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowExportLogsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Notification Channel Dialog */}
      <Dialog open={showEditNotificationDialog} onOpenChange={setShowEditNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notification Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input defaultValue={selectedNotificationChannel?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label>Configuration</Label>
              <Input defaultValue={selectedNotificationChannel?.config || ''} placeholder="e.g., email@example.com or #channel" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enabled</Label>
              <Switch defaultChecked={selectedNotificationChannel?.enabled} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditNotificationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateNotificationChannel}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Notification Channel Dialog */}
      <Dialog open={showAddNotificationDialog} onOpenChange={setShowAddNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notification Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel Type</Label>
              <Select value={notificationForm.name} onValueChange={(v) => setNotificationForm({ ...notificationForm, name: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Slack">Slack</SelectItem>
                  <SelectItem value="PagerDuty">PagerDuty</SelectItem>
                  <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                  <SelectItem value="Webhook">Webhook</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Configuration</Label>
              <Input
                value={notificationForm.config}
                onChange={(e) => setNotificationForm({ ...notificationForm, config: e.target.value })}
                placeholder="e.g., email@example.com or webhook URL"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable immediately</Label>
              <Switch
                checked={notificationForm.enabled}
                onCheckedChange={(v) => setNotificationForm({ ...notificationForm, enabled: v })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddNotificationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveNotificationChannel}>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Escalation Policy Dialog */}
      <Dialog open={showEditEscalationDialog} onOpenChange={setShowEditEscalationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Escalation Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tier Name</Label>
              <Input defaultValue={selectedEscalationPolicy?.tier || ''} />
            </div>
            <div className="space-y-2">
              <Label>Team/Person</Label>
              <Input defaultValue={selectedEscalationPolicy?.team || ''} />
            </div>
            <div className="space-y-2">
              <Label>Delay Before Escalation</Label>
              <Select defaultValue={selectedEscalationPolicy?.delay || '15 min'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="5 min">5 minutes</SelectItem>
                  <SelectItem value="15 min">15 minutes</SelectItem>
                  <SelectItem value="30 min">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditEscalationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateEscalationPolicy}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Escalation Tier Dialog */}
      <Dialog open={showAddEscalationDialog} onOpenChange={setShowAddEscalationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Escalation Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tier Name *</Label>
              <Input
                value={escalationForm.tier}
                onChange={(e) => setEscalationForm({ ...escalationForm, tier: e.target.value })}
                placeholder="e.g., Tier 4"
              />
            </div>
            <div className="space-y-2">
              <Label>Team/Person *</Label>
              <Input
                value={escalationForm.team}
                onChange={(e) => setEscalationForm({ ...escalationForm, team: e.target.value })}
                placeholder="e.g., VP of Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label>Delay Before Escalation</Label>
              <Select value={escalationForm.delay} onValueChange={(v) => setEscalationForm({ ...escalationForm, delay: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="5 min">5 minutes</SelectItem>
                  <SelectItem value="15 min">15 minutes</SelectItem>
                  <SelectItem value="30 min">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddEscalationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveEscalationPolicy}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cloud Provider Dialog */}
      <Dialog open={showCloudProviderDialog} onOpenChange={setShowCloudProviderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCloudProvider?.status === 'connected' ? 'Configure' : 'Connect'} {selectedCloudProvider?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCloudProvider?.status === 'connected' ? (
              <>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Connected</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last sync: {selectedCloudProvider?.lastSync}</p>
                </div>
                <div className="space-y-2">
                  <Label>Sync Interval</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every 1 minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-import resources</Label>
                  <Switch defaultChecked />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your {selectedCloudProvider?.name} account to import metrics and resources.
                </p>
                <div className="space-y-2">
                  <Label>Access Key / Service Account</Label>
                  <Input placeholder="Enter your access key..." />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key / Credentials</Label>
                  <Input type="password" placeholder="Enter your secret..." />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select defaultValue="us-east-1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCloudProviderDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConnectCloudProvider}>
                {selectedCloudProvider?.status === 'connected' ? 'Save Changes' : 'Connect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Container Platform Dialog */}
      <Dialog open={showContainerPlatformDialog} onOpenChange={setShowContainerPlatformDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedContainerPlatform?.status === 'connected' ? 'Manage' : 'Connect'} {selectedContainerPlatform?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedContainerPlatform?.status === 'connected' ? (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Box className="h-5 w-5" />
                    <span className="font-medium">{selectedContainerPlatform?.clusters} cluster(s) connected</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Auto-discovery</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Discover new services automatically</span>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Namespace filter</Label>
                  <Input placeholder="e.g., production,staging" />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect to {selectedContainerPlatform?.name} to monitor your containerized workloads.
                </p>
                <div className="space-y-2">
                  <Label>Cluster URL</Label>
                  <Input placeholder="https://kubernetes.example.com:6443" />
                </div>
                <div className="space-y-2">
                  <Label>Authentication Token</Label>
                  <Input type="password" placeholder="Enter service account token..." />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowContainerPlatformDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConnectContainerPlatform}>
                {selectedContainerPlatform?.status === 'connected' ? 'Save Changes' : 'Connect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* APM Agent Dialog */}
      <Dialog open={showAPMAgentDialog} onOpenChange={setShowAPMAgentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAPMAgent?.language} APM Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Version</span>
                <Badge variant="outline">v{selectedAPMAgent?.version}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Active Services</span>
                <span>{selectedAPMAgent?.services}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View documentation and configuration options for the {selectedAPMAgent?.language} APM agent.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAPMAgentDialog(false)}>
                Close
              </Button>
              <Button className="flex-1" onClick={handleViewAPMAgent}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={showEditWebhookDialog} onOpenChange={setShowEditWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Webhook Name</Label>
              <Input defaultValue={selectedWebhook?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input defaultValue={selectedWebhook?.url || ''} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="space-y-2">
                {['alerts', 'metrics', 'logs', 'traces'].map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={event}
                      defaultChecked={selectedWebhook?.events.includes(event)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={event} className="text-sm capitalize">{event}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditWebhookDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateWebhook}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Dialog */}
      <Dialog open={showDeleteWebhookDialog} onOpenChange={setShowDeleteWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the webhook "{selectedWebhook?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteWebhookDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteWebhook}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Webhook Name *</Label>
              <Input
                value={webhookForm.name}
                onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                placeholder="e.g., Slack Alerts"
              />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                placeholder="https://hooks.example.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label>Events to send</Label>
              <div className="space-y-2">
                {['alerts', 'metrics', 'logs', 'traces'].map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`new-${event}`}
                      defaultChecked={event === 'alerts'}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`new-${event}`} className="text-sm capitalize">{event}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddWebhookDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveWebhook}>
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy API Key Dialog */}
      <Dialog open={showCopyApiKeyDialog} onOpenChange={setShowCopyApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Security Notice</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep your API key secure. Do not share it publicly or commit it to version control.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCopyApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCopyApiKey}>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Regenerating your API key will invalidate the current key. All integrations using the old key will stop working.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleRegenerateApiKey}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate New API Key Dialog */}
      <Dialog open={showGenerateNewKeyDialog} onOpenChange={setShowGenerateNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Key Name *</Label>
              <Input
                value={apiKeyForm.name}
                onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                placeholder="e.g., Production CI/CD"
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <Select value={apiKeyForm.permissions} onValueChange={(v) => setApiKeyForm({ ...apiKeyForm, permissions: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Read">Read Only</SelectItem>
                  <SelectItem value="Write">Read & Write</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowGenerateNewKeyDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleGenerateNewApiKey}>
                <Key className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Dialog */}
      <Dialog open={showDeleteApiKeyDialog} onOpenChange={setShowDeleteApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the API key "{selectedApiKey?.name}"? Any integrations using this key will stop working.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteApiKey}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documentation Dialog */}
      <Dialog open={showDocumentationDialog} onOpenChange={setShowDocumentationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agent Documentation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 dark:text-gray-400">
              You will be redirected to the official Kazi agent installation documentation.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-mono">https://docs.kazi.app/agent-installation</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDocumentationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleOpenDocumentation}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Documentation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purge Data Dialog */}
      <Dialog open={showPurgeDataDialog} onOpenChange={setShowPurgeDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Purge All Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertOctagon className="h-5 w-5" />
                <span className="font-medium">Danger Zone</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will permanently delete all metrics, logs, and traces. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type "PURGE" to confirm</Label>
              <Input placeholder="PURGE" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPurgeDataDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handlePurgeData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Purge All Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Environment Dialog */}
      <Dialog open={showResetEnvironmentDialog} onOpenChange={setShowResetEnvironmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reset Environment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertOctagon className="h-5 w-5" />
                <span className="font-medium">This Cannot Be Undone</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will reset all settings to defaults, remove all integrations, and disconnect all monitoring agents.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type "RESET" to confirm</Label>
              <Input placeholder="RESET" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowResetEnvironmentDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleResetEnvironment}>
                <AlertOctagon className="h-4 w-4 mr-2" />
                Reset Environment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
