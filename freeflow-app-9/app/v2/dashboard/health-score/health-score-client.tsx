'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Activity,
  Server,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Bell,
  Settings,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
  Search,
  Filter,
  Cpu,
  HardDrive,
  Container,
  Cloud,
  Shield,
  Eye,
  BarChart3,
  Minus,
  Calendar,
  Download,
  Layers,
  GitBranch,
  Box,
  Plus,
  FileText,
  Users,
  Network,
  Gauge,
  Trash2
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




import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Types
type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'unknown'
type AlertSeverity = 'critical' | 'warning' | 'info'
type IncidentStatus = 'open' | 'acknowledged' | 'resolved'

interface ServiceHealth {
  id: string
  name: string
  type: 'api' | 'web' | 'database' | 'cache' | 'queue' | 'external'
  status: ServiceStatus
  apdexScore: number
  errorRate: number
  responseTime: {
    p50: number
    p95: number
    p99: number
  }
  throughput: number
  uptime: number
  lastDeployment: string
  version: string
  instances: number
  dependencies: string[]
  healthChecks: {
    name: string
    status: 'passing' | 'failing'
    lastCheck: string
  }[]
}

interface HostMetrics {
  id: string
  hostname: string
  type: 'server' | 'container' | 'kubernetes'
  status: ServiceStatus
  cpu: number
  memory: number
  disk: number
  network: {
    in: number
    out: number
  }
  processes: number
  uptime: string
  os: string
  region: string
  tags: string[]
}

interface AlertRule {
  id: string
  name: string
  description: string
  severity: AlertSeverity
  condition: string
  threshold: string
  service: string
  enabled: boolean
  lastTriggered: string | null
  notifications: string[]
}

interface Incident {
  id: string
  title: string
  severity: AlertSeverity
  status: IncidentStatus
  service: string
  startedAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
  duration: string
  assignee: string | null
  timeline: {
    time: string
    event: string
    user: string | null
  }[]
}

interface SLO {
  id: string
  name: string
  service: string
  target: number
  current: number
  budgetRemaining: number
  budgetConsumed: number
  timeWindow: '7d' | '30d' | '90d'
  indicator: 'availability' | 'latency' | 'error_rate'
  status: 'met' | 'at_risk' | 'breached'
  history: { date: string; value: number }[]
}

// Database types
interface DbHealthScore {
  id: string
  user_id: string
  health_code: string
  customer_name: string
  customer_id: string | null
  account_type: string
  overall_score: number
  category: string
  trend: string
  previous_score: number
  score_change: number
  product_usage: number
  engagement: number
  support_health: number
  financial: number
  sentiment: number
  risk_factors: number
  opportunities: number
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface HealthScoreFormState {
  customer_name: string
  account_type: string
  overall_score: number
  category: string
  trend: string
  product_usage: number
  engagement: number
  support_health: number
  financial: number
  sentiment: number
  notes: string
}

const initialFormState: HealthScoreFormState = {
  customer_name: '',
  account_type: 'standard',
  overall_score: 50,
  category: 'fair',
  trend: 'stable',
  product_usage: 50,
  engagement: 50,
  support_health: 50,
  financial: 50,
  sentiment: 50,
  notes: '',
}

// Mock Data
const mockServices: ServiceHealth[] = [
  {
    id: '1',
    name: 'API Gateway',
    type: 'api',
    status: 'healthy',
    apdexScore: 0.94,
    errorRate: 0.12,
    responseTime: { p50: 45, p95: 120, p99: 250 },
    throughput: 15420,
    uptime: 99.98,
    lastDeployment: '2024-12-20T14:30:00Z',
    version: 'v2.4.1',
    instances: 6,
    dependencies: ['auth-service', 'user-service', 'redis-cache'],
    healthChecks: [
      { name: 'HTTP Health', status: 'passing', lastCheck: '10s ago' },
      { name: 'Database Connection', status: 'passing', lastCheck: '10s ago' },
      { name: 'Cache Connection', status: 'passing', lastCheck: '10s ago' }
    ]
  },
  {
    id: '2',
    name: 'Auth Service',
    type: 'api',
    status: 'healthy',
    apdexScore: 0.97,
    errorRate: 0.05,
    responseTime: { p50: 25, p95: 80, p99: 150 },
    throughput: 8930,
    uptime: 99.99,
    lastDeployment: '2024-12-18T10:00:00Z',
    version: 'v1.8.3',
    instances: 4,
    dependencies: ['postgres-primary', 'redis-cache'],
    healthChecks: [
      { name: 'HTTP Health', status: 'passing', lastCheck: '10s ago' },
      { name: 'JWT Validation', status: 'passing', lastCheck: '10s ago' }
    ]
  },
  {
    id: '3',
    name: 'User Service',
    type: 'api',
    status: 'degraded',
    apdexScore: 0.78,
    errorRate: 2.3,
    responseTime: { p50: 85, p95: 450, p99: 1200 },
    throughput: 5620,
    uptime: 99.85,
    lastDeployment: '2024-12-22T09:15:00Z',
    version: 'v3.1.0',
    instances: 3,
    dependencies: ['postgres-primary', 'elasticsearch'],
    healthChecks: [
      { name: 'HTTP Health', status: 'passing', lastCheck: '10s ago' },
      { name: 'Search Index', status: 'failing', lastCheck: '10s ago' }
    ]
  },
  {
    id: '4',
    name: 'PostgreSQL Primary',
    type: 'database',
    status: 'healthy',
    apdexScore: 0.96,
    errorRate: 0.02,
    responseTime: { p50: 8, p95: 25, p99: 45 },
    throughput: 42000,
    uptime: 99.999,
    lastDeployment: '2024-12-01T00:00:00Z',
    version: '15.4',
    instances: 1,
    dependencies: [],
    healthChecks: [
      { name: 'Connection Pool', status: 'passing', lastCheck: '5s ago' },
      { name: 'Replication Lag', status: 'passing', lastCheck: '5s ago' }
    ]
  },
  {
    id: '5',
    name: 'Redis Cache',
    type: 'cache',
    status: 'healthy',
    apdexScore: 0.99,
    errorRate: 0.01,
    responseTime: { p50: 1, p95: 3, p99: 8 },
    throughput: 125000,
    uptime: 99.99,
    lastDeployment: '2024-12-10T06:00:00Z',
    version: '7.2',
    instances: 3,
    dependencies: [],
    healthChecks: [
      { name: 'Memory Usage', status: 'passing', lastCheck: '5s ago' },
      { name: 'Cluster Health', status: 'passing', lastCheck: '5s ago' }
    ]
  },
  {
    id: '6',
    name: 'Payment Gateway',
    type: 'external',
    status: 'healthy',
    apdexScore: 0.92,
    errorRate: 0.4,
    responseTime: { p50: 180, p95: 450, p99: 800 },
    throughput: 1250,
    uptime: 99.95,
    lastDeployment: 'N/A',
    version: 'external',
    instances: 0,
    dependencies: [],
    healthChecks: [
      { name: 'API Availability', status: 'passing', lastCheck: '30s ago' }
    ]
  }
]

const mockHosts: HostMetrics[] = [
  {
    id: '1',
    hostname: 'prod-api-01',
    type: 'server',
    status: 'healthy',
    cpu: 45,
    memory: 62,
    disk: 38,
    network: { in: 125, out: 89 },
    processes: 234,
    uptime: '45d 12h',
    os: 'Ubuntu 22.04',
    region: 'us-east-1',
    tags: ['production', 'api', 'tier-1']
  },
  {
    id: '2',
    hostname: 'prod-api-02',
    type: 'server',
    status: 'healthy',
    cpu: 52,
    memory: 58,
    disk: 41,
    network: { in: 118, out: 92 },
    processes: 228,
    uptime: '45d 12h',
    os: 'Ubuntu 22.04',
    region: 'us-east-1',
    tags: ['production', 'api', 'tier-1']
  },
  {
    id: '3',
    hostname: 'prod-db-primary',
    type: 'server',
    status: 'healthy',
    cpu: 35,
    memory: 78,
    disk: 52,
    network: { in: 245, out: 312 },
    processes: 145,
    uptime: '120d 8h',
    os: 'Ubuntu 22.04',
    region: 'us-east-1',
    tags: ['production', 'database', 'primary']
  },
  {
    id: '4',
    hostname: 'k8s-node-01',
    type: 'kubernetes',
    status: 'healthy',
    cpu: 68,
    memory: 71,
    disk: 45,
    network: { in: 450, out: 380 },
    processes: 512,
    uptime: '30d 4h',
    os: 'Container Linux',
    region: 'us-east-1',
    tags: ['production', 'kubernetes', 'workers']
  },
  {
    id: '5',
    hostname: 'k8s-node-02',
    type: 'kubernetes',
    status: 'degraded',
    cpu: 92,
    memory: 85,
    disk: 67,
    network: { in: 520, out: 410 },
    processes: 584,
    uptime: '30d 4h',
    os: 'Container Linux',
    region: 'us-east-1',
    tags: ['production', 'kubernetes', 'workers']
  }
]

const mockAlerts: AlertRule[] = [
  {
    id: '1',
    name: 'High Error Rate',
    description: 'Alert when error rate exceeds threshold',
    severity: 'critical',
    condition: 'error_rate > threshold',
    threshold: '5%',
    service: 'All Services',
    enabled: true,
    lastTriggered: '2024-12-22T15:30:00Z',
    notifications: ['#ops-alerts', 'oncall@company.com']
  },
  {
    id: '2',
    name: 'High Response Time',
    description: 'Alert when p95 latency exceeds threshold',
    severity: 'warning',
    condition: 'response_time.p95 > threshold',
    threshold: '500ms',
    service: 'API Gateway',
    enabled: true,
    lastTriggered: null,
    notifications: ['#ops-alerts']
  },
  {
    id: '3',
    name: 'Low Apdex Score',
    description: 'Alert when Apdex drops below threshold',
    severity: 'warning',
    condition: 'apdex_score < threshold',
    threshold: '0.85',
    service: 'All Services',
    enabled: true,
    lastTriggered: '2024-12-22T14:00:00Z',
    notifications: ['#ops-alerts']
  },
  {
    id: '4',
    name: 'High CPU Usage',
    description: 'Alert when CPU exceeds threshold',
    severity: 'warning',
    condition: 'cpu_percent > threshold',
    threshold: '85%',
    service: 'Infrastructure',
    enabled: true,
    lastTriggered: '2024-12-23T10:15:00Z',
    notifications: ['#infra-alerts']
  },
  {
    id: '5',
    name: 'Service Down',
    description: 'Alert when service health check fails',
    severity: 'critical',
    condition: 'health_check == failing',
    threshold: '3 consecutive failures',
    service: 'All Services',
    enabled: true,
    lastTriggered: null,
    notifications: ['#ops-critical', 'oncall@company.com', 'PagerDuty']
  }
]

const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'User Service degraded performance',
    severity: 'warning',
    status: 'open',
    service: 'User Service',
    startedAt: '2024-12-23T09:45:00Z',
    acknowledgedAt: '2024-12-23T09:50:00Z',
    resolvedAt: null,
    duration: '2h 15m',
    assignee: 'John Smith',
    timeline: [
      { time: '09:45', event: 'Incident detected - High latency', user: null },
      { time: '09:50', event: 'Incident acknowledged', user: 'John Smith' },
      { time: '10:15', event: 'Root cause identified: Elasticsearch index corruption', user: 'John Smith' },
      { time: '10:30', event: 'Mitigation in progress: Rebuilding index', user: 'John Smith' }
    ]
  },
  {
    id: 'INC-002',
    title: 'K8s node high resource usage',
    severity: 'warning',
    status: 'acknowledged',
    service: 'Infrastructure',
    startedAt: '2024-12-23T10:15:00Z',
    acknowledgedAt: '2024-12-23T10:20:00Z',
    resolvedAt: null,
    duration: '1h 45m',
    assignee: 'Sarah Chen',
    timeline: [
      { time: '10:15', event: 'Alert triggered - CPU > 90%', user: null },
      { time: '10:20', event: 'Incident acknowledged', user: 'Sarah Chen' },
      { time: '10:35', event: 'Investigating pod resource limits', user: 'Sarah Chen' }
    ]
  },
  {
    id: 'INC-003',
    title: 'API Gateway spike in 5xx errors',
    severity: 'critical',
    status: 'resolved',
    service: 'API Gateway',
    startedAt: '2024-12-22T15:30:00Z',
    acknowledgedAt: '2024-12-22T15:32:00Z',
    resolvedAt: '2024-12-22T16:15:00Z',
    duration: '45m',
    assignee: 'Mike Johnson',
    timeline: [
      { time: '15:30', event: 'Critical alert - Error rate > 5%', user: null },
      { time: '15:32', event: 'Incident acknowledged', user: 'Mike Johnson' },
      { time: '15:45', event: 'Root cause: Database connection pool exhausted', user: 'Mike Johnson' },
      { time: '15:50', event: 'Mitigation: Increased pool size', user: 'Mike Johnson' },
      { time: '16:15', event: 'Incident resolved - Error rate normalized', user: 'Mike Johnson' }
    ]
  }
]

const mockSLOs: SLO[] = [
  {
    id: '1',
    name: 'API Availability',
    service: 'API Gateway',
    target: 99.9,
    current: 99.98,
    budgetRemaining: 87,
    budgetConsumed: 13,
    timeWindow: '30d',
    indicator: 'availability',
    status: 'met',
    history: [
      { date: '12/17', value: 99.99 },
      { date: '12/18', value: 99.97 },
      { date: '12/19', value: 99.98 },
      { date: '12/20', value: 99.96 },
      { date: '12/21', value: 99.99 },
      { date: '12/22', value: 99.85 },
      { date: '12/23', value: 99.98 }
    ]
  },
  {
    id: '2',
    name: 'API Latency',
    service: 'API Gateway',
    target: 95,
    current: 96.2,
    budgetRemaining: 72,
    budgetConsumed: 28,
    timeWindow: '30d',
    indicator: 'latency',
    status: 'met',
    history: [
      { date: '12/17', value: 97.1 },
      { date: '12/18', value: 96.8 },
      { date: '12/19', value: 95.9 },
      { date: '12/20', value: 96.5 },
      { date: '12/21', value: 97.2 },
      { date: '12/22', value: 94.8 },
      { date: '12/23', value: 96.2 }
    ]
  },
  {
    id: '3',
    name: 'User Service Error Rate',
    service: 'User Service',
    target: 99.5,
    current: 97.7,
    budgetRemaining: 12,
    budgetConsumed: 88,
    timeWindow: '30d',
    indicator: 'error_rate',
    status: 'at_risk',
    history: [
      { date: '12/17', value: 99.2 },
      { date: '12/18', value: 98.8 },
      { date: '12/19', value: 98.1 },
      { date: '12/20', value: 97.5 },
      { date: '12/21', value: 97.9 },
      { date: '12/22', value: 96.8 },
      { date: '12/23', value: 97.7 }
    ]
  },
  {
    id: '4',
    name: 'Database Availability',
    service: 'PostgreSQL Primary',
    target: 99.99,
    current: 99.999,
    budgetRemaining: 95,
    budgetConsumed: 5,
    timeWindow: '30d',
    indicator: 'availability',
    status: 'met',
    history: [
      { date: '12/17', value: 100 },
      { date: '12/18', value: 100 },
      { date: '12/19', value: 99.99 },
      { date: '12/20', value: 100 },
      { date: '12/21', value: 100 },
      { date: '12/22', value: 100 },
      { date: '12/23', value: 99.999 }
    ]
  }
]

// Enhanced Competitive Upgrade Data
const mockHealthScoreAIInsights = [
  { id: '1', type: 'success' as const, title: 'System Health', description: 'All critical services running at 99.9% uptime.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Uptime' },
  { id: '2', type: 'info' as const, title: 'Performance Trend', description: 'API response times improved 20% after optimization.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '3', type: 'warning' as const, title: 'Resource Alert', description: 'Database server CPU at 85%. Consider scaling.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Resources' },
]

const mockHealthScoreCollaborators = [
  { id: '1', name: 'SRE Lead', avatar: '/avatars/sre.jpg', status: 'online' as const, role: 'Reliability', lastActive: 'Now' },
  { id: '2', name: 'Platform Eng', avatar: '/avatars/platform.jpg', status: 'online' as const, role: 'Platform', lastActive: '5m ago' },
  { id: '3', name: 'DBA', avatar: '/avatars/dba.jpg', status: 'away' as const, role: 'Database', lastActive: '45m ago' },
]

const mockHealthScorePredictions = [
  { id: '1', label: 'Uptime %', current: 99.9, target: 99.99, predicted: 99.95, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Latency (ms)', current: 120, target: 100, predicted: 105, confidence: 75, trend: 'down' as const },
  { id: '3', label: 'Error Rate', current: 0.5, target: 0.1, predicted: 0.3, confidence: 80, trend: 'down' as const },
]

const mockHealthScoreActivities = [
  { id: '1', user: 'SRE Lead', action: 'resolved', target: 'high latency incident', timestamp: '30m ago', type: 'success' as const },
  { id: '2', user: 'System', action: 'detected', target: 'memory spike on web-03', timestamp: '1h ago', type: 'warning' as const },
  { id: '3', user: 'Platform Eng', action: 'deployed', target: 'performance optimization', timestamp: '3h ago', type: 'info' as const },
]

// Quick actions defined inside the component to use state setters
const getHealthScoreQuickActions = (
  setShowRunCheckDialog: (v: boolean) => void,
  setShowViewMetricsDialog: (v: boolean) => void,
  setShowAlertsDialog: (v: boolean) => void,
  setShowReportsDialog: (v: boolean) => void
) => [
  { id: '1', label: 'Run Check', icon: 'Activity', shortcut: 'C', action: () => setShowRunCheckDialog(true) },
  { id: '2', label: 'View Metrics', icon: 'BarChart', shortcut: 'M', action: () => setShowViewMetricsDialog(true) },
  { id: '3', label: 'Alerts', icon: 'Bell', shortcut: 'A', action: () => setShowAlertsDialog(true) },
  { id: '4', label: 'Reports', icon: 'FileText', shortcut: 'R', action: () => setShowReportsDialog(true) },
]

export default function HealthScoreClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null)
  const [selectedHost, setSelectedHost] = useState<HostMetrics | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '1d' | '7d' | '30d'>('1d')

  // Quick Action Dialog States
  const [showRunCheckDialog, setShowRunCheckDialog] = useState(false)
  const [showViewMetricsDialog, setShowViewMetricsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false)
  const [showAPMDialog, setShowAPMDialog] = useState(false)
  const [showTracesDialog, setShowTracesDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showDependenciesDialog, setShowDependenciesDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showAddAlertRuleDialog, setShowAddAlertRuleDialog] = useState(false)
  const [showOnCallDialog, setShowOnCallDialog] = useState(false)
  const [showAlertHistoryDialog, setShowAlertHistoryDialog] = useState(false)
  const [showAlertAnalyticsDialog, setShowAlertAnalyticsDialog] = useState(false)
  const [showCreateSLODialog, setShowCreateSLODialog] = useState(false)
  const [showSLIDialog, setShowSLIDialog] = useState(false)
  const [showSLOHistoryDialog, setShowSLOHistoryDialog] = useState(false)
  const [showViewAllSLOsDialog, setShowViewAllSLOsDialog] = useState(false)

  // Infrastructure Dialog States
  const [showServersDialog, setShowServersDialog] = useState(false)
  const [showDatabasesDialog, setShowDatabasesDialog] = useState(false)
  const [showCloudDialog, setShowCloudDialog] = useState(false)
  const [showContainersDialog, setShowContainersDialog] = useState(false)
  const [showNetworkDialog, setShowNetworkDialog] = useState(false)
  const [showStorageDialog, setShowStorageDialog] = useState(false)
  const [showComputeDialog, setShowComputeDialog] = useState(false)

  // Additional Dialog States
  const [showDiagnosticsDialog, setShowDiagnosticsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showCriticalAlertsDialog, setShowCriticalAlertsDialog] = useState(false)
  const [showResolveIncidentsDialog, setShowResolveIncidentsDialog] = useState(false)
  const [showObjectivesDialog, setShowObjectivesDialog] = useState(false)
  const [showErrorBudgetDialog, setShowErrorBudgetDialog] = useState(false)
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false)
  const [showScheduleEditorDialog, setShowScheduleEditorDialog] = useState(false)

  // Database State
  const [dbHealthScores, setDbHealthScores] = useState<DbHealthScore[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<HealthScoreFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Computed stats
  const overallHealth = useMemo(() => {
    const healthyCount = mockServices.filter(s => s.status === 'healthy').length
    const totalCount = mockServices.length
    return Math.round((healthyCount / totalCount) * 100)
  }, [])

  const avgApdex = useMemo(() => {
    return mockServices.reduce((sum, s) => sum + s.apdexScore, 0) / mockServices.length
  }, [])

  const avgErrorRate = useMemo(() => {
    return mockServices.reduce((sum, s) => sum + s.errorRate, 0) / mockServices.length
  }, [])

  const openIncidents = mockIncidents.filter(i => i.status !== 'resolved').length

  // Generate health code
  const generateHealthCode = () => `HS-${Date.now().toString(36).toUpperCase()}`

  // Fetch health scores from Supabase
  const fetchHealthScores = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbHealthScores(data || [])
    } catch (error) {
      console.error('Error fetching health scores:', error)
      toast.error('Failed to load health scores')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchHealthScores()
  }, [fetchHealthScores])

  // Create health score
  const handleCreateHealthScore = async () => {
    if (!formState.customer_name.trim()) {
      toast.error('Customer name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create health scores')
        return
      }

      const { error } = await supabase.from('health_scores').insert({
        user_id: user.id,
        health_code: generateHealthCode(),
        customer_name: formState.customer_name,
        account_type: formState.account_type,
        overall_score: formState.overall_score,
        category: formState.category,
        trend: formState.trend,
        product_usage: formState.product_usage,
        engagement: formState.engagement,
        support_health: formState.support_health,
        financial: formState.financial,
        sentiment: formState.sentiment,
        notes: formState.notes || null,
      })

      if (error) throw error

      toast.success('Health score created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchHealthScores()
    } catch (error) {
      console.error('Error creating health score:', error)
      toast.error('Failed to create health score')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update health score
  const handleUpdateHealthScore = async () => {
    if (!editingId || !formState.customer_name.trim()) {
      toast.error('Customer name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const current = dbHealthScores.find(h => h.id === editingId)
      const { error } = await supabase
        .from('health_scores')
        .update({
          customer_name: formState.customer_name,
          account_type: formState.account_type,
          overall_score: formState.overall_score,
          previous_score: current?.overall_score || 0,
          score_change: formState.overall_score - (current?.overall_score || 0),
          category: formState.category,
          trend: formState.trend,
          product_usage: formState.product_usage,
          engagement: formState.engagement,
          support_health: formState.support_health,
          financial: formState.financial,
          sentiment: formState.sentiment,
          notes: formState.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)

      if (error) throw error

      toast.success('Health score updated successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      setEditingId(null)
      fetchHealthScores()
    } catch (error) {
      console.error('Error updating health score:', error)
      toast.error('Failed to update health score')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete health score (soft delete)
  const handleDeleteHealthScore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_scores')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      toast.success('Health score deleted')
      fetchHealthScores()
    } catch (error) {
      console.error('Error deleting health score:', error)
      toast.error('Failed to delete health score')
    }
  }

  // Edit health score
  const handleEditHealthScore = (healthScore: DbHealthScore) => {
    setFormState({
      customer_name: healthScore.customer_name,
      account_type: healthScore.account_type,
      overall_score: healthScore.overall_score,
      category: healthScore.category,
      trend: healthScore.trend,
      product_usage: healthScore.product_usage,
      engagement: healthScore.engagement,
      support_health: healthScore.support_health,
      financial: healthScore.financial,
      sentiment: healthScore.sentiment,
      notes: healthScore.notes || '',
    })
    setEditingId(healthScore.id)
    setShowCreateDialog(true)
  }

  // Refresh metrics handler
  const handleRefreshMetrics = async () => {
    toast.info('Refreshing metrics', { description: 'Fetching latest health data...' })
    setLoading(true)
    await fetchHealthScores()
    toast.success('Metrics refreshed')
  }

  // Combined stats from DB + mock data
  const combinedOverallHealth = useMemo(() => {
    const dbAvg = dbHealthScores.length > 0
      ? dbHealthScores.reduce((sum, h) => sum + h.overall_score, 0) / dbHealthScores.length
      : 0
    return dbHealthScores.length > 0 ? Math.round((overallHealth + dbAvg) / 2) : overallHealth
  }, [overallHealth, dbHealthScores])

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/20'
      case 'degraded': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'critical': return 'bg-red-500/10 border-red-500/20'
      default: return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getSLOStatusColor = (status: SLO['status']) => {
    switch (status) {
      case 'met': return 'text-green-500 bg-green-500/10'
      case 'at_risk': return 'text-yellow-500 bg-yellow-500/10'
      case 'breached': return 'text-red-500 bg-red-500/10'
    }
  }

  const getServiceIcon = (type: ServiceHealth['type']) => {
    switch (type) {
      case 'api': return Globe
      case 'web': return Globe
      case 'database': return Database
      case 'cache': return Zap
      case 'queue': return Layers
      case 'external': return ExternalLink
    }
  }

  const getHostIcon = (type: HostMetrics['type']) => {
    switch (type) {
      case 'server': return Server
      case 'container': return Container
      case 'kubernetes': return Box
    }
  }

  const handleRunDiagnostics = () => {
    setShowDiagnosticsDialog(true)
  }

  const handleExportHealth = () => {
    setShowExportDialog(true)
  }

  const handleConfigureAlerts = () => {
    setShowAlertsDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">System Health</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    New Relic Level
                  </span>
                </div>
                <p className="text-emerald-100 max-w-2xl">
                  Real-time application performance monitoring with service health, infrastructure metrics, and SLO tracking
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiveMode
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isLiveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isLiveMode ? 'Live' : 'Paused'}
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg border-0 focus:ring-2 focus:ring-white/50"
                >
                  <option value="1h" className="text-gray-900">Last 1 hour</option>
                  <option value="4h" className="text-gray-900">Last 4 hours</option>
                  <option value="1d" className="text-gray-900">Last 24 hours</option>
                  <option value="7d" className="text-gray-900">Last 7 days</option>
                  <option value="30d" className="text-gray-900">Last 30 days</option>
                </select>
                <button
                  onClick={handleRefreshMetrics}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Overall Health</div>
                <div className="text-3xl font-bold text-white">{overallHealth}%</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2% from yesterday
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Avg Apdex</div>
                <div className="text-3xl font-bold text-white">{avgApdex.toFixed(2)}</div>
                <div className="text-emerald-200 text-xs mt-1">Target: 0.90</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Error Rate</div>
                <div className="text-3xl font-bold text-white">{avgErrorRate.toFixed(2)}%</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> -0.3% from yesterday
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Services</div>
                <div className="text-3xl font-bold text-white">{mockServices.length}</div>
                <div className="text-emerald-200 text-xs mt-1">
                  {mockServices.filter(s => s.status === 'healthy').length} healthy
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Open Incidents</div>
                <div className="text-3xl font-bold text-white">{openIncidents}</div>
                <div className={`text-xs mt-1 ${openIncidents > 0 ? 'text-yellow-300' : 'text-emerald-200'}`}>
                  {openIncidents > 0 ? 'Requires attention' : 'All clear'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
            <TabsTrigger value="infrastructure" className="rounded-lg">Infrastructure</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">Alerts</TabsTrigger>
            <TabsTrigger value="slos" className="rounded-lg">SLOs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">System Health Overview</h2>
                  <p className="text-emerald-100">Datadog-level observability and monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{combinedOverallHealth}%</p>
                    <p className="text-emerald-200 text-sm">Health Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.filter(s => s.status === 'healthy').length}</p>
                    <p className="text-emerald-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{openIncidents}</p>
                    <p className="text-emerald-200 text-sm">Incidents</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowCreateDialog(true)}
                className="h-20 flex-col gap-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Add Score</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleRefreshMetrics}
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-xs font-medium">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleConfigureAlerts}
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Alerts</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleRunDiagnostics}
                className="h-20 flex-col gap-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Metrics</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowReportsDialog(true)}
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Reports</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportHealth}
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSecurityDialog(true)}
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-medium">Security</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsDialog(true)}
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Service Status Grid */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mockServices.map(service => {
                    const Icon = getServiceIcon(service.type)
                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${getStatusBg(service.status)}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{service.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Apdex: {service.apdexScore}</span>
                          <span className={getStatusColor(service.status)}>{service.status}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Incidents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Incidents</h2>
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium">
                    {openIncidents} Open
                  </span>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {mockIncidents.filter(i => i.status !== 'resolved').map(incident => (
                      <button
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                            incident.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {incident.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {incident.service} · {incident.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {openIncidents === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>No active incidents</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Customer Health Scores from Database */}
            {dbHealthScores.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Health Scores</h2>
                  <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Score
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbHealthScores.slice(0, 6).map(score => (
                    <div key={score.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{score.customer_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          score.category === 'excellent' ? 'bg-green-500/10 text-green-500' :
                          score.category === 'good' ? 'bg-emerald-500/10 text-emerald-500' :
                          score.category === 'fair' ? 'bg-yellow-500/10 text-yellow-500' :
                          score.category === 'poor' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {score.category}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {score.overall_score}%
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span className={`flex items-center gap-1 ${
                          score.trend === 'improving' ? 'text-green-500' :
                          score.trend === 'declining' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {score.trend === 'improving' ? <TrendingUp className="w-3 h-3" /> :
                           score.trend === 'declining' ? <TrendingDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {score.trend}
                        </span>
                        <span>·</span>
                        <span>{score.account_type}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all ${
                            score.overall_score >= 80 ? 'bg-green-500' :
                            score.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score.overall_score}%` }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditHealthScore(score)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteHealthScore(score.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLO Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SLO Status</h2>
                <button
                  onClick={() => setShowViewAllSLOsDialog(true)}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {mockSLOs.map(slo => (
                  <div key={slo.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{slo.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSLOStatusColor(slo.status)}`}>
                        {slo.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {slo.current}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Target: {slo.target}% · Budget: {slo.budgetRemaining}% remaining
                    </div>
                    <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          slo.status === 'met' ? 'bg-green-500' :
                          slo.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${slo.budgetRemaining}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6 mt-6">
            {/* Services Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Service Monitoring</h2>
                  <p className="text-blue-100">New Relic-level APM and service health</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.length}</p>
                    <p className="text-blue-200 text-sm">Services</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.filter(s => s.status === 'healthy').length}</p>
                    <p className="text-blue-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.filter(s => s.status === 'degraded' || s.status === 'critical').length}</p>
                    <p className="text-blue-200 text-sm">Issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowAddServiceDialog(true)}
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Add Service</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAPMDialog(true)}
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
              >
                <Activity className="w-5 h-5" />
                <span className="text-xs font-medium">APM</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowTracesDialog(true)}
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs font-medium">Traces</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowViewMetricsDialog(true)}
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Metrics</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowLogsDialog(true)}
                className="h-20 flex-col gap-2 bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 hover:scale-105 transition-all duration-200"
              >
                <Eye className="w-5 h-5" />
                <span className="text-xs font-medium">Logs</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDependenciesDialog(true)}
                className="h-20 flex-col gap-2 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 hover:scale-105 transition-all duration-200"
              >
                <GitBranch className="w-5 h-5" />
                <span className="text-xs font-medium">Dependencies</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportHealth}
                className="h-20 flex-col gap-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsDialog(true)}
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowFilterDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Apdex</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Error Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Throughput</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Uptime</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockServices.filter(s =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(service => {
                    const Icon = getServiceIcon(service.type)
                    return (
                      <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{service.version} · {service.instances} instances</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(service.status)} ${getStatusColor(service.status)}`}>
                            {service.status === 'healthy' ? <CheckCircle className="w-3 h-3" /> :
                             service.status === 'degraded' ? <AlertTriangle className="w-3 h-3" /> :
                             <XCircle className="w-3 h-3" />}
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-mono font-medium ${
                            service.apdexScore >= 0.9 ? 'text-green-600 dark:text-green-400' :
                            service.apdexScore >= 0.75 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {service.apdexScore.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-mono ${
                            service.errorRate < 1 ? 'text-green-600 dark:text-green-400' :
                            service.errorRate < 5 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {service.errorRate.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white font-mono">
                            p50: {service.responseTime.p50}ms
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            p95: {service.responseTime.p95}ms · p99: {service.responseTime.p99}ms
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white font-mono">
                            {service.throughput.toLocaleString()} rpm
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white font-mono">
                            {service.uptime}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedService(service)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6 mt-6">
            {/* Infrastructure Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Infrastructure</h2>
                  <p className="text-amber-100">AWS CloudWatch-level infrastructure monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockHosts.length}</p>
                    <p className="text-amber-200 text-sm">Resources</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockHosts.filter(i => i.status === 'healthy').length}</p>
                    <p className="text-amber-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(mockHosts.reduce((sum, i) => sum + i.cpu, 0) / mockHosts.length).toFixed(0)}%</p>
                    <p className="text-amber-200 text-sm">Avg CPU</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowServersDialog(true)}
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
              >
                <Server className="w-5 h-5" />
                <span className="text-xs font-medium">Servers</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDatabasesDialog(true)}
                className="h-20 flex-col gap-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:scale-105 transition-all duration-200"
              >
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">Databases</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCloudDialog(true)}
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
              >
                <Cloud className="w-5 h-5" />
                <span className="text-xs font-medium">Cloud</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowContainersDialog(true)}
                className="h-20 flex-col gap-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:scale-105 transition-all duration-200"
              >
                <Container className="w-5 h-5" />
                <span className="text-xs font-medium">Containers</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNetworkDialog(true)}
                className="h-20 flex-col gap-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 hover:scale-105 transition-all duration-200"
              >
                <Network className="w-5 h-5" />
                <span className="text-xs font-medium">Network</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowStorageDialog(true)}
                className="h-20 flex-col gap-2 bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400 hover:scale-105 transition-all duration-200"
              >
                <HardDrive className="w-5 h-5" />
                <span className="text-xs font-medium">Storage</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowComputeDialog(true)}
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
              >
                <Cpu className="w-5 h-5" />
                <span className="text-xs font-medium">Compute</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsDialog(true)}
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Servers</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockHosts.filter(h => h.type === 'server').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mockHosts.filter(h => h.type === 'server' && h.status === 'healthy').length} healthy
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Box className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Kubernetes Nodes</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockHosts.filter(h => h.type === 'kubernetes').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mockHosts.filter(h => h.type === 'kubernetes' && h.status === 'healthy').length} healthy
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Container className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Containers</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">22 running</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Host</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">CPU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Memory</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Disk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Network</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Uptime</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockHosts.map(host => {
                    const Icon = getHostIcon(host.type)
                    return (
                      <tr key={host.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white font-mono">{host.hostname}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{host.os} · {host.region}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(host.status)} ${getStatusColor(host.status)}`}>
                            {host.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  host.cpu < 70 ? 'bg-green-500' :
                                  host.cpu < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${host.cpu}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-mono">{host.cpu}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  host.memory < 70 ? 'bg-green-500' :
                                  host.memory < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${host.memory}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-mono">{host.memory}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  host.disk < 70 ? 'bg-green-500' :
                                  host.disk < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${host.disk}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-mono">{host.disk}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white font-mono">
                            ↓{host.network.in} MB/s ↑{host.network.out} MB/s
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-white">{host.uptime}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedHost(host)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            {/* Alerts Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Alerting & Notifications</h2>
                  <p className="text-rose-100">PagerDuty-level incident management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAlerts.length}</p>
                    <p className="text-rose-200 text-sm">Rules</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAlerts.filter(a => a.enabled).length}</p>
                    <p className="text-rose-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{openIncidents}</p>
                    <p className="text-rose-200 text-sm">Open</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowAddAlertRuleDialog(true)}
                className="h-20 flex-col gap-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">New Rule</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAlertsDialog(true)}
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Active</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCriticalAlertsDialog(true)}
                className="h-20 flex-col gap-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:scale-105 transition-all duration-200"
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-medium">Critical</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowResolveIncidentsDialog(true)}
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Resolve</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowOnCallDialog(true)}
                className="h-20 flex-col gap-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 hover:scale-105 transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">On-Call</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAlertHistoryDialog(true)}
                className="h-20 flex-col gap-2 bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400 hover:scale-105 transition-all duration-200"
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-medium">History</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAlertAnalyticsDialog(true)}
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Analytics</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsDialog(true)}
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alert Rules */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Rules</h2>
                  <button
                    onClick={() => setShowAddAlertRuleDialog(true)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                  >
                    + Add Rule
                  </button>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mockAlerts.map(alert => (
                      <div key={alert.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bell className={`w-4 h-4 ${
                              alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <span className="font-medium text-gray-900 dark:text-white">{alert.name}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={alert.enabled} className="sr-only peer" readOnly />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className={`px-2 py-0.5 rounded ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span>Threshold: {alert.threshold}</span>
                          <span>Service: {alert.service}</span>
                        </div>
                        {alert.lastTriggered && (
                          <p className="text-xs text-gray-400 mt-2">
                            Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Incidents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incidents</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs">
                      {mockIncidents.filter(i => i.status === 'open').length} Open
                    </span>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                      {mockIncidents.filter(i => i.status === 'acknowledged').length} Acknowledged
                    </span>
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mockIncidents.map(incident => (
                      <button
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {incident.status === 'resolved' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : incident.severity === 'critical' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {incident.id}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            incident.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                            incident.status === 'acknowledged' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mb-1">{incident.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{incident.service}</span>
                          <span>·</span>
                          <span>{incident.duration}</span>
                          {incident.assignee && (
                            <>
                              <span>·</span>
                              <span>Assigned: {incident.assignee}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* SLOs Tab */}
          <TabsContent value="slos" className="space-y-6 mt-6">
            {/* SLOs Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Service Level Objectives</h2>
                  <p className="text-purple-100">Google SRE-level SLO tracking and error budgets</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSLOs.length}</p>
                    <p className="text-purple-200 text-sm">SLOs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSLOs.filter(s => s.current >= s.target).length}</p>
                    <p className="text-purple-200 text-sm">On Track</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSLOs.filter(s => s.current < s.target).length}</p>
                    <p className="text-purple-200 text-sm">At Risk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SLOs Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowCreateSLODialog(true)}
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Create SLO</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowObjectivesDialog(true)}
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
              >
                <Target className="w-5 h-5" />
                <span className="text-xs font-medium">Objectives</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowErrorBudgetDialog(true)}
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-medium">Error Budget</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSLIDialog(true)}
                className="h-20 flex-col gap-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-105 transition-all duration-200"
              >
                <Gauge className="w-5 h-5" />
                <span className="text-xs font-medium">SLIs</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowReportsDialog(true)}
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Reports</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSLOHistoryDialog(true)}
                className="h-20 flex-col gap-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:scale-105 transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-medium">History</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportHealth}
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsDialog(true)}
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Level Objectives</h2>
              <button
                onClick={() => setShowCreateSLODialog(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                + Create SLO
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSLOs.map(slo => (
                <div key={slo.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{slo.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{slo.service}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSLOStatusColor(slo.status)}`}>
                      {slo.status === 'met' ? 'Meeting Target' : slo.status === 'at_risk' ? 'At Risk' : 'Breached'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{slo.current}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{slo.target}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Window</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{slo.timeWindow}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Error Budget</span>
                      <span className={`font-medium ${
                        slo.budgetRemaining > 50 ? 'text-green-600 dark:text-green-400' :
                        slo.budgetRemaining > 20 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {slo.budgetRemaining}% remaining
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          slo.budgetRemaining > 50 ? 'bg-green-500' :
                          slo.budgetRemaining > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${slo.budgetRemaining}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">7-Day Trend</div>
                    <div className="flex items-end gap-1 h-16">
                      {slo.history.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className={`w-full rounded-t transition-all ${
                              point.value >= slo.target ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ height: `${Math.max(20, (point.value / 100) * 60)}px` }}
                          />
                          <span className="text-[10px] text-gray-400 mt-1">{point.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockHealthScoreAIInsights}
              title="Health Score Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockHealthScoreCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockHealthScorePredictions}
              title="System Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockHealthScoreActivities}
            title="Health Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={getHealthScoreQuickActions(
              setShowRunCheckDialog,
              setShowViewMetricsDialog,
              setShowAlertsDialog,
              setShowReportsDialog
            )}
            variant="grid"
          />
        </div>

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedService && (() => {
                  const Icon = getServiceIcon(selectedService.type)
                  return <Icon className="w-5 h-5 text-emerald-500" />
                })()}
                {selectedService?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Apdex Score</div>
                    <div className={`text-2xl font-bold ${
                      selectedService.apdexScore >= 0.9 ? 'text-green-600' :
                      selectedService.apdexScore >= 0.75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedService.apdexScore}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error Rate</div>
                    <div className={`text-2xl font-bold ${
                      selectedService.errorRate < 1 ? 'text-green-600' :
                      selectedService.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedService.errorRate}%
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Throughput</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedService.throughput.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">rpm</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Response Time</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.responseTime.p50}ms</div>
                      <div className="text-xs text-gray-500">p50</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.responseTime.p95}ms</div>
                      <div className="text-xs text-gray-500">p95</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.responseTime.p99}ms</div>
                      <div className="text-xs text-gray-500">p99</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Health Checks</h4>
                  <div className="space-y-2">
                    {selectedService.healthChecks.map((check, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          {check.status === 'passing' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-gray-900 dark:text-white">{check.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{check.lastCheck}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.dependencies.map(dep => (
                      <span key={dep} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                        {dep}
                      </span>
                    ))}
                    {selectedService.dependencies.length === 0 && (
                      <span className="text-gray-500 dark:text-gray-400">No dependencies</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Version: {selectedService.version}</span>
                  <span>{selectedService.instances} instances</span>
                  <span>Uptime: {selectedService.uptime}%</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Host Detail Dialog */}
        <Dialog open={!!selectedHost} onOpenChange={() => setSelectedHost(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedHost && (() => {
                  const Icon = getHostIcon(selectedHost.type)
                  return <Icon className="w-5 h-5 text-emerald-500" />
                })()}
                {selectedHost?.hostname}
              </DialogTitle>
            </DialogHeader>
            {selectedHost && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(selectedHost.status)} ${getStatusColor(selectedHost.status)}`}>
                    {selectedHost.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{selectedHost.os}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">·</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{selectedHost.region}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">CPU</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedHost.cpu}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedHost.cpu < 70 ? 'bg-green-500' : selectedHost.cpu < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedHost.cpu}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Memory</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedHost.memory}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedHost.memory < 70 ? 'bg-green-500' : selectedHost.memory < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedHost.memory}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Disk</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedHost.disk}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedHost.disk < 70 ? 'bg-green-500' : selectedHost.disk < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedHost.disk}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network In</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedHost.network.in} MB/s</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network Out</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedHost.network.out} MB/s</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Processes: {selectedHost.processes}</span>
                  <span>Uptime: {selectedHost.uptime}</span>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedHost.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Incident Detail Dialog */}
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedIncident?.severity === 'critical' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                {selectedIncident?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedIncident.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      selectedIncident.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                      selectedIncident.status === 'acknowledged' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {selectedIncident.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Service:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedIncident.service}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedIncident.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedIncident.assignee || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Started:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(selectedIncident.startedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selectedIncident.timeline.map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          {i < selectedIncident.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{event.time}</div>
                          <div className="text-sm text-gray-900 dark:text-white">{event.event}</div>
                          {event.user && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">by {event.user}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedIncident.status !== 'resolved' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        toast.success('Incident Acknowledged', { description: `${selectedIncident.id} has been acknowledged` })
                        setSelectedIncident(null)
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Incident Resolved', { description: `${selectedIncident.id} has been marked as resolved` })
                        setSelectedIncident(null)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Health Score Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) {
            setFormState(initialFormState)
            setEditingId(null)
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Health Score' : 'Create Health Score'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formState.customer_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="account_type">Account Type</Label>
                  <select
                    id="account_type"
                    value={formState.account_type}
                    onChange={(e) => setFormState(prev => ({ ...prev, account_type: e.target.value }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="overall_score">Overall Score</Label>
                  <Input
                    id="overall_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.overall_score}
                    onChange={(e) => setFormState(prev => ({ ...prev, overall_score: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formState.category}
                    onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="trend">Trend</Label>
                  <select
                    id="trend"
                    value={formState.trend}
                    onChange={(e) => setFormState(prev => ({ ...prev, trend: e.target.value }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="improving">Improving</option>
                    <option value="stable">Stable</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="product_usage">Product Usage</Label>
                  <Input
                    id="product_usage"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.product_usage}
                    onChange={(e) => setFormState(prev => ({ ...prev, product_usage: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="engagement">Engagement</Label>
                  <Input
                    id="engagement"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.engagement}
                    onChange={(e) => setFormState(prev => ({ ...prev, engagement: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="support_health">Support</Label>
                  <Input
                    id="support_health"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.support_health}
                    onChange={(e) => setFormState(prev => ({ ...prev, support_health: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="financial">Financial</Label>
                  <Input
                    id="financial"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.financial}
                    onChange={(e) => setFormState(prev => ({ ...prev, financial: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Input
                    id="sentiment"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.sentiment}
                    onChange={(e) => setFormState(prev => ({ ...prev, sentiment: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formState.notes}
                  onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={editingId ? handleUpdateHealthScore : handleCreateHealthScore} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Run Health Check Dialog */}
        <Dialog open={showRunCheckDialog} onOpenChange={setShowRunCheckDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Run Health Check
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Run a comprehensive health check across all services and infrastructure.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">API Services</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">Database Connections</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">Cache Systems</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">External Integrations</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowRunCheckDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Health check completed successfully')
                  setShowRunCheckDialog(false)
                }}>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Check
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Metrics Dialog */}
        <Dialog open={showViewMetricsDialog} onOpenChange={setShowViewMetricsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                System Metrics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Response Time</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">45ms</div>
                  <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3" /> -12% from last hour
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request Rate</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2K/s</div>
                  <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +8% from last hour
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error Rate</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">0.12%</div>
                  <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3" /> -0.05% from last hour
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uptime</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">99.98%</div>
                  <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowViewMetricsDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Opening detailed metrics dashboard')
                  setShowViewMetricsDialog(false)
                }}>
                  View Full Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Alert Configuration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">High Error Rate</p>
                      <p className="text-xs text-gray-500">Triggers when error rate exceeds 5%</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">High Latency</p>
                      <p className="text-xs text-gray-500">Triggers when p95 exceeds 500ms</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Service Down</p>
                      <p className="text-xs text-gray-500">Triggers on health check failures</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Alert settings saved')
                  setShowAlertsDialog(false)
                }}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reports Dialog */}
        <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Generate Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the type of health report to generate.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    toast.success('Generating Daily Summary', { description: 'Report will be ready shortly' })
                    setShowReportsDialog(false)
                  }}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">Daily Summary</p>
                  <p className="text-xs text-gray-500">Overview of the last 24 hours</p>
                </button>
                <button
                  onClick={() => {
                    toast.success('Generating Weekly Analysis', { description: 'Report will be ready shortly' })
                    setShowReportsDialog(false)
                  }}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Analysis</p>
                  <p className="text-xs text-gray-500">Trends and patterns over 7 days</p>
                </button>
                <button
                  onClick={() => {
                    toast.success('Generating Monthly Report', { description: 'Report will be ready shortly' })
                    setShowReportsDialog(false)
                  }}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">Monthly Report</p>
                  <p className="text-xs text-gray-500">Comprehensive 30-day analysis</p>
                </button>
                <button
                  onClick={() => {
                    setShowReportsDialog(false)
                    setShowCustomReportDialog(true)
                  }}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">Custom Report</p>
                  <p className="text-xs text-gray-500">Select custom date range</p>
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Report generation started')
                  setShowReportsDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Dialog */}
        <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" />
                Security Status
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">SSL Certificates</span>
                  </div>
                  <span className="text-xs text-green-500">Valid</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Firewall Rules</span>
                  </div>
                  <span className="text-xs text-green-500">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Access Controls</span>
                  </div>
                  <span className="text-xs text-green-500">Configured</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Vulnerability Scan</span>
                  </div>
                  <span className="text-xs text-yellow-500">2 Warnings</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowSecurityDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Running security scan')
                  setShowSecurityDialog(false)
                }}>
                  Run Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Health Score Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">Auto-refresh interval</span>
                  <select className="text-sm border rounded-lg px-2 py-1 dark:bg-gray-800 dark:border-gray-700">
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">Show degraded services first</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm">Enable notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Settings saved')
                  setShowSettingsDialog(false)
                }}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Service Dialog */}
        <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Add Service
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service_name">Service Name</Label>
                <Input id="service_name" placeholder="Enter service name" />
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <select id="service_type" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="api">API</option>
                  <option value="web">Web</option>
                  <option value="database">Database</option>
                  <option value="cache">Cache</option>
                  <option value="queue">Queue</option>
                </select>
              </div>
              <div>
                <Label htmlFor="service_url">Endpoint URL</Label>
                <Input id="service_url" placeholder="https://api.example.com/health" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Service added successfully')
                  setShowAddServiceDialog(false)
                }}>
                  Add Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* APM Dialog */}
        <Dialog open={showAPMDialog} onOpenChange={setShowAPMDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Application Performance Monitoring
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transactions</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2M</div>
                  <div className="text-xs text-green-500">+5% today</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Duration</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">45ms</div>
                  <div className="text-xs text-green-500">-3% today</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAPMDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.info('Opening full APM dashboard')
                  setShowAPMDialog(false)
                }}>
                  View Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Traces Dialog */}
        <Dialog open={showTracesDialog} onOpenChange={setShowTracesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-500" />
                Distributed Traces
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recent traces from distributed services
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GET /api/users</span>
                    <span className="text-xs text-green-500">45ms</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">5 spans - 3 services</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">POST /api/orders</span>
                    <span className="text-xs text-yellow-500">250ms</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">12 spans - 6 services</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowTracesDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.info('Opening traces explorer')
                  setShowTracesDialog(false)
                }}>
                  View All Traces
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-fuchsia-500" />
                Service Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-gray-900 rounded-lg font-mono text-xs text-green-400 max-h-60 overflow-auto">
                <div>[2024-12-23 12:00:01] INFO  - API Gateway started</div>
                <div>[2024-12-23 12:00:02] INFO  - Connected to database</div>
                <div>[2024-12-23 12:00:03] INFO  - Cache warmed up</div>
                <div>[2024-12-23 12:00:15] WARN  - High memory usage detected</div>
                <div>[2024-12-23 12:00:30] INFO  - Request handled: GET /api/health</div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowLogsDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.info('Opening log explorer')
                  setShowLogsDialog(false)
                }}>
                  View All Logs
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dependencies Dialog */}
        <Dialog open={showDependenciesDialog} onOpenChange={setShowDependenciesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-pink-500" />
                Service Dependencies
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage service dependencies
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">API Gateway &rarr; Auth Service</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">API Gateway &rarr; User Service</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">User Service &rarr; Elasticsearch</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowDependenciesDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.info('Opening dependency map')
                  setShowDependenciesDialog(false)
                }}>
                  View Full Map
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                Filter Services
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="outline" size="sm">Healthy</Button>
                  <Button variant="outline" size="sm">Degraded</Button>
                  <Button variant="outline" size="sm">Critical</Button>
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button variant="outline" size="sm">API</Button>
                  <Button variant="outline" size="sm">Database</Button>
                  <Button variant="outline" size="sm">Cache</Button>
                  <Button variant="outline" size="sm">External</Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Reset</Button>
                <Button onClick={() => {
                  toast.success('Filters applied')
                  setShowFilterDialog(false)
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Alert Rule Dialog */}
        <Dialog open={showAddAlertRuleDialog} onOpenChange={setShowAddAlertRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                Create Alert Rule
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alert_name">Rule Name</Label>
                <Input id="alert_name" placeholder="e.g., High Error Rate" />
              </div>
              <div>
                <Label htmlFor="alert_severity">Severity</Label>
                <select id="alert_severity" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div>
                <Label htmlFor="alert_condition">Condition</Label>
                <Input id="alert_condition" placeholder="error_rate > 5%" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAddAlertRuleDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Alert rule created')
                  setShowAddAlertRuleDialog(false)
                }}>
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* On-Call Dialog */}
        <Dialog open={showOnCallDialog} onOpenChange={setShowOnCallDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-500" />
                On-Call Schedule
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Currently On-Call</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">John Smith</div>
                <div className="text-xs text-gray-500 mt-1">Until Dec 24, 9:00 AM</div>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Sarah Chen</div>
                    <div className="text-xs text-gray-500">Dec 24 - Dec 25</div>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Next</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowOnCallDialog(false)}>Close</Button>
                <Button onClick={() => {
                  setShowOnCallDialog(false)
                  setShowScheduleEditorDialog(true)
                }}>
                  Edit Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert History Dialog */}
        <Dialog open={showAlertHistoryDialog} onOpenChange={setShowAlertHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-lime-500" />
                Alert History
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-500">High Error Rate</span>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">API Gateway - Resolved in 15m</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-500">High CPU</span>
                      <span className="text-xs text-gray-500">5h ago</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">k8s-node-02 - Resolved in 30m</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-500">Low Apdex</span>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">User Service - Resolved in 2h</div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAlertHistoryDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Analytics Dialog */}
        <Dialog open={showAlertAnalyticsDialog} onOpenChange={setShowAlertAnalyticsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Alert Analytics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-xs text-gray-500">Total Alerts</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15m</div>
                  <div className="text-xs text-gray-500">Avg Response</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
                  <div className="text-xs text-gray-500">Resolved</div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAlertAnalyticsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create SLO Dialog */}
        <Dialog open={showCreateSLODialog} onOpenChange={setShowCreateSLODialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                Create SLO
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slo_name">SLO Name</Label>
                <Input id="slo_name" placeholder="e.g., API Availability" />
              </div>
              <div>
                <Label htmlFor="slo_service">Service</Label>
                <select id="slo_service" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>API Gateway</option>
                  <option>Auth Service</option>
                  <option>User Service</option>
                  <option>PostgreSQL Primary</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="slo_target">Target (%)</Label>
                  <Input id="slo_target" type="number" placeholder="99.9" />
                </div>
                <div>
                  <Label htmlFor="slo_window">Time Window</Label>
                  <select id="slo_window" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowCreateSLODialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('SLO created successfully')
                  setShowCreateSLODialog(false)
                }}>
                  Create SLO
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* SLI Dialog */}
        <Dialog open={showSLIDialog} onOpenChange={setShowSLIDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-500" />
                Service Level Indicators
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Availability</span>
                    <span className="text-sm font-bold text-green-500">99.98%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '99.98%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Latency (p95)</span>
                    <span className="text-sm font-bold text-green-500">120ms</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '76%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm font-bold text-yellow-500">0.5%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowSLIDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* SLO History Dialog */}
        <Dialog open={showSLOHistoryDialog} onOpenChange={setShowSLOHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                SLO History
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Availability</span>
                      <span className="text-xs text-green-500">Met - 99.98%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">December 2024 - Target: 99.9%</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Latency</span>
                      <span className="text-xs text-green-500">Met - 96.2%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">December 2024 - Target: 95%</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User Service Error Rate</span>
                      <span className="text-xs text-yellow-500">At Risk - 97.7%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">December 2024 - Target: 99.5%</div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowSLOHistoryDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View All SLOs Dialog */}
        <Dialog open={showViewAllSLOsDialog} onOpenChange={setShowViewAllSLOsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                All Service Level Objectives
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockSLOs.map(slo => (
                    <div key={slo.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{slo.name}</div>
                          <div className="text-xs text-gray-500">{slo.service}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSLOStatusColor(slo.status)}`}>
                          {slo.status === 'met' ? 'Meeting Target' : slo.status === 'at_risk' ? 'At Risk' : 'Breached'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: <strong>{slo.current}%</strong></span>
                        <span>Target: {slo.target}%</span>
                        <span>Budget: {slo.budgetRemaining}% left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowViewAllSLOsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diagnostics Dialog */}
        <Dialog open={showDiagnosticsDialog} onOpenChange={setShowDiagnosticsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                System Diagnostics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Run comprehensive diagnostics across all system components.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Server Health Check</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Database Connectivity</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Network className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Network Latency Test</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Security Scan</span>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Disk Usage Analysis</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowDiagnosticsDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Diagnostics completed', { description: 'All selected checks passed successfully' })
                  setShowDiagnosticsDialog(false)
                }}>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Diagnostics
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-500" />
                Export Health Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose the format and data to include in your export.
              </p>
              <div className="space-y-3">
                <div>
                  <Label>Export Format</Label>
                  <select className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="pdf">PDF Report</option>
                    <option value="csv">CSV Data</option>
                    <option value="json">JSON Data</option>
                    <option value="excel">Excel Spreadsheet</option>
                  </select>
                </div>
                <div>
                  <Label>Time Range</Label>
                  <select className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Include Data</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Service Health Metrics</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Infrastructure Status</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Alert History</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">SLO Performance</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Export started', { description: 'Your report will be downloaded shortly' })
                  setShowExportDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Servers Dialog */}
        <Dialog open={showServersDialog} onOpenChange={setShowServersDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-500" />
                Server Infrastructure
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockHosts.filter(h => h.type === 'server').length}
                  </div>
                  <div className="text-xs text-gray-500">Total Servers</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {mockHosts.filter(h => h.type === 'server' && h.status === 'healthy').length}
                  </div>
                  <div className="text-xs text-gray-500">Healthy</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {mockHosts.filter(h => h.type === 'server' && h.status === 'degraded').length}
                  </div>
                  <div className="text-xs text-gray-500">Degraded</div>
                </div>
              </div>
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {mockHosts.filter(h => h.type === 'server').map(host => (
                    <div key={host.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${host.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="font-medium">{host.hostname}</span>
                        </div>
                        <span className="text-xs text-gray-500">{host.region}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-xs">
                        <div>CPU: <span className={host.cpu > 80 ? 'text-red-500' : 'text-green-500'}>{host.cpu}%</span></div>
                        <div>Memory: <span className={host.memory > 80 ? 'text-red-500' : 'text-green-500'}>{host.memory}%</span></div>
                        <div>Disk: <span className={host.disk > 80 ? 'text-red-500' : 'text-green-500'}>{host.disk}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowServersDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Refreshing server metrics')
                  setShowServersDialog(false)
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Databases Dialog */}
        <Dialog open={showDatabasesDialog} onOpenChange={setShowDatabasesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-500" />
                Database Connections
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Active Connections</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">142</div>
                  <div className="text-xs text-green-500">of 200 max</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Avg Query Time</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">8ms</div>
                  <div className="text-xs text-green-500">-2ms from avg</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">PostgreSQL Primary</span>
                    </div>
                    <span className="text-xs text-green-500">Healthy</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Version 15.4 - 42K queries/min</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">PostgreSQL Replica</span>
                    </div>
                    <span className="text-xs text-green-500">Synced</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Replication lag: 0ms</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Redis Cache</span>
                    </div>
                    <span className="text-xs text-green-500">Healthy</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Memory: 62% - Hit rate: 98.5%</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowDatabasesDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Database connections verified')
                  setShowDatabasesDialog(false)
                }}>
                  Test Connections
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cloud Dialog */}
        <Dialog open={showCloudDialog} onOpenChange={setShowCloudDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-red-500" />
                Cloud Resources
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-xs text-gray-500">EC2 Instances</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
                  <div className="text-xs text-gray-500">RDS Instances</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                  <div className="text-xs text-gray-500">S3 Buckets</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AWS us-east-1</span>
                    <span className="text-xs text-green-500">All systems operational</span>
                  </div>
                  <div className="text-xs text-gray-500">8 instances running</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AWS eu-west-1</span>
                    <span className="text-xs text-green-500">All systems operational</span>
                  </div>
                  <div className="text-xs text-gray-500">4 instances running</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowCloudDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Cloud resources synchronized')
                  setShowCloudDialog(false)
                }}>
                  Sync Resources
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Containers Dialog */}
        <Dialog open={showContainersDialog} onOpenChange={setShowContainersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Container className="w-5 h-5 text-rose-500" />
                Container Orchestration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">48</div>
                  <div className="text-xs text-gray-500">Running Pods</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">45</div>
                  <div className="text-xs text-gray-500">Healthy</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">3</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">api-gateway</span>
                    <span className="text-xs text-green-500">6/6 replicas</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Deployment healthy</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">auth-service</span>
                    <span className="text-xs text-green-500">4/4 replicas</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Deployment healthy</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">user-service</span>
                    <span className="text-xs text-yellow-500">2/3 replicas</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">1 pod pending</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowContainersDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Containers scaled successfully')
                  setShowContainersDialog(false)
                }}>
                  Scale Pods
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Network Dialog */}
        <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-yellow-500" />
                Network Topology
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Inbound Traffic</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2 GB/s</div>
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +5% from avg
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Outbound Traffic</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">890 MB/s</div>
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> -2% from avg
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Load Balancer</span>
                    <span className="text-xs text-green-500">Active</span>
                  </div>
                  <div className="text-xs text-gray-500">12,450 active connections</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CDN</span>
                    <span className="text-xs text-green-500">98.5% hit rate</span>
                  </div>
                  <div className="text-xs text-gray-500">45 edge locations</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">DNS</span>
                    <span className="text-xs text-green-500">All resolving</span>
                  </div>
                  <div className="text-xs text-gray-500">Avg response: 12ms</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowNetworkDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Network scan completed')
                  setShowNetworkDialog(false)
                }}>
                  Run Network Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Storage Dialog */}
        <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-lime-500" />
                Storage Volumes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">2.4 TB</div>
                  <div className="text-xs text-gray-500">Total Storage</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1.1 TB</div>
                  <div className="text-xs text-gray-500">Used</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">1.3 TB</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">/dev/sda1 (Root)</span>
                    <span className="text-xs text-green-500">38% used</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '38%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">/dev/sdb1 (Data)</span>
                    <span className="text-xs text-yellow-500">68% used</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">/dev/sdc1 (Backup)</span>
                    <span className="text-xs text-green-500">25% used</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowStorageDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Storage cleanup initiated')
                  setShowStorageDialog(false)
                }}>
                  Clean Up Storage
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compute Dialog */}
        <Dialog open={showComputeDialog} onOpenChange={setShowComputeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-green-500" />
                Compute Resources
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Total vCPUs</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">128</div>
                  <div className="text-xs text-gray-500">Across all instances</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Avg CPU Usage</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">52%</div>
                  <div className="text-xs text-green-500">Within normal range</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">prod-api-01</span>
                    <span className="text-xs">45% CPU</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">prod-api-02</span>
                    <span className="text-xs">52% CPU</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '52%' }}></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">k8s-node-02</span>
                    <span className="text-xs text-red-500">92% CPU</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowComputeDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Auto-scaling configured')
                  setShowComputeDialog(false)
                }}>
                  Configure Scaling
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Critical Alerts Dialog */}
        <Dialog open={showCriticalAlertsDialog} onOpenChange={setShowCriticalAlertsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Critical Alerts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing only critical severity alerts that require immediate attention.
              </p>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {mockAlerts.filter(a => a.severity === 'critical').map(alert => (
                    <div key={alert.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-red-700 dark:text-red-400">{alert.name}</span>
                        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded">Critical</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Threshold: {alert.threshold}</span>
                        <span>Service: {alert.service}</span>
                      </div>
                    </div>
                  ))}
                  {mockAlerts.filter(a => a.severity === 'critical').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No critical alerts at this time</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowCriticalAlertsDialog(false)}>Close</Button>
                <Button variant="destructive" onClick={() => {
                  toast.success('Alert notifications sent')
                  setShowCriticalAlertsDialog(false)
                }}>
                  Escalate All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resolve Incidents Dialog */}
        <Dialog open={showResolveIncidentsDialog} onOpenChange={setShowResolveIncidentsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Resolve Incidents
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select incidents to resolve. Only acknowledged incidents can be resolved.
              </p>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {mockIncidents.filter(i => i.status !== 'resolved').map(incident => (
                    <div key={incident.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1 rounded" defaultChecked={incident.status === 'acknowledged'} disabled={incident.status !== 'acknowledged'} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{incident.title}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              incident.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {incident.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{incident.service} - Duration: {incident.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {mockIncidents.filter(i => i.status !== 'resolved').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>All incidents have been resolved</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="space-y-2">
                <Label htmlFor="resolution_notes">Resolution Notes</Label>
                <Textarea id="resolution_notes" placeholder="Describe how the incidents were resolved..." />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowResolveIncidentsDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Selected incidents resolved')
                  setShowResolveIncidentsDialog(false)
                }}>
                  Resolve Selected
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Objectives Dialog */}
        <Dialog open={showObjectivesDialog} onOpenChange={setShowObjectivesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Service Level Objectives
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">{mockSLOs.filter(s => s.status === 'met').length}</div>
                  <div className="text-xs text-gray-500">Meeting Target</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">{mockSLOs.filter(s => s.status === 'at_risk').length}</div>
                  <div className="text-xs text-gray-500">At Risk</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-500">{mockSLOs.filter(s => s.status === 'breached').length}</div>
                  <div className="text-xs text-gray-500">Breached</div>
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {mockSLOs.map(slo => (
                    <div key={slo.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{slo.name}</div>
                          <div className="text-xs text-gray-500">{slo.service}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSLOStatusColor(slo.status)}`}>
                          {slo.status === 'met' ? 'Meeting' : slo.status === 'at_risk' ? 'At Risk' : 'Breached'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: <strong>{slo.current}%</strong></span>
                        <span>Target: {slo.target}%</span>
                        <span>Window: {slo.timeWindow}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowObjectivesDialog(false)}>Close</Button>
                <Button onClick={() => {
                  setShowObjectivesDialog(false)
                  setShowCreateSLODialog(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New SLO
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Budget Dialog */}
        <Dialog open={showErrorBudgetDialog} onOpenChange={setShowErrorBudgetDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Error Budget Status
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Error budget consumption across all service level objectives.
              </p>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {mockSLOs.map(slo => (
                    <div key={slo.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{slo.name}</div>
                          <div className="text-xs text-gray-500">{slo.service}</div>
                        </div>
                        <span className={`text-sm font-bold ${slo.budgetRemaining > 50 ? 'text-green-500' : slo.budgetRemaining > 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {slo.budgetRemaining}% remaining
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Budget Consumed: {slo.budgetConsumed}%</span>
                          <span>Time Window: {slo.timeWindow}</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${slo.budgetConsumed < 50 ? 'bg-green-500' : slo.budgetConsumed < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${slo.budgetConsumed}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-500">0%</span>
                          <span className="text-yellow-500">50%</span>
                          <span className="text-red-500">100%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowErrorBudgetDialog(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Error budget report exported')
                  setShowErrorBudgetDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Report Dialog */}
        <Dialog open={showCustomReportDialog} onOpenChange={setShowCustomReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Custom Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a custom date range for your health report.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" type="date" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" type="date" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Report Type</Label>
                <select className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Full Health Report</option>
                  <option>Service Performance Only</option>
                  <option>Infrastructure Only</option>
                  <option>Incidents & Alerts</option>
                  <option>SLO Compliance</option>
                </select>
              </div>
              <div>
                <Label>Export Format</Label>
                <select className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>PDF</option>
                  <option>CSV</option>
                  <option>Excel</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowCustomReportDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Custom report generation started')
                  setShowCustomReportDialog(false)
                }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Editor Dialog */}
        <Dialog open={showScheduleEditorDialog} onOpenChange={setShowScheduleEditorDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                On-Call Schedule Editor
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Rotation Type</Label>
                  <select className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Bi-Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" defaultValue="09:00" className="mt-1" />
                </div>
                <div>
                  <Label>Team Members</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">John Smith</span>
                      </div>
                      <span className="text-xs text-gray-500">Primary</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Sarah Chen</span>
                      </div>
                      <span className="text-xs text-gray-500">Secondary</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Mike Johnson</span>
                      </div>
                      <span className="text-xs text-gray-500">Backup</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Escalation Policy</Label>
                  <select className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option>Standard (15 min)</option>
                    <option>Aggressive (5 min)</option>
                    <option>Relaxed (30 min)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowScheduleEditorDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success('Schedule updated successfully')
                  setShowScheduleEditorDialog(false)
                }}>
                  Save Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
