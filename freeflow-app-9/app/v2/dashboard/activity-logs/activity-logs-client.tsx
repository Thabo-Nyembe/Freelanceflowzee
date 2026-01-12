'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  type ActivityLog
} from '@/lib/hooks/use-activity-logs'
import {
  Activity,
  Search,
  Download,
  Upload,
  RefreshCw,
  Clock,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  User,
  Globe,
  Smartphone,
  Server,
  Database,
  Code,
  Terminal,
  Bookmark,
  BookmarkCheck,
  Bell,
  Settings,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Play,
  Pause,
  Copy,
  Tag,
  Layers,
  GitCommit,
  Shield,
  Lock,
  Plus,
  Minus,
  Key,
  Webhook,
  Link,
  Mail,
  AlertOctagon,
  Trash2,
  Link2,
  HardDrive,
  Sliders,
  Archive,
  History,
  Gauge
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Type definitions for Datadog-level logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'
type LogSource = 'api' | 'web' | 'mobile' | 'worker' | 'cron' | 'webhook'
type LogStatus = 'ok' | 'info' | 'warn' | 'error'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: LogSource
  service: string
  host: string
  message: string
  traceId: string | null
  spanId: string | null
  userId: string | null
  userName: string | null
  userEmail: string | null
  sessionId: string | null
  requestId: string | null
  method: string | null
  path: string | null
  statusCode: number | null
  duration: number | null
  ip: string | null
  userAgent: string | null
  country: string | null
  tags: string[]
  attributes: Record<string, unknown>
  stackTrace: string | null
}

interface LogPattern {
  id: string
  pattern: string
  count: number
  level: LogLevel
  firstSeen: string
  lastSeen: string
  trend: 'up' | 'down' | 'stable'
  services: string[]
}

interface SavedQuery {
  id: string
  name: string
  query: string
  filters: Record<string, string[]>
  createdAt: string
  isDefault: boolean
}

interface LogMetric {
  name: string
  value: number
  change: number
  unit: string
}

interface LogStats {
  totalLogs: number
  logsPerMinute: number
  errorRate: number
  avgLatency: number
  uniqueUsers: number
  uniqueSessions: number
  byLevel: Record<LogLevel, number>
  bySource: Record<LogSource, number>
  byService: Record<string, number>
  topErrors: { message: string; count: number }[]
  timeline: { time: string; count: number; errors: number }[]
}

// Mock data
const mockLogs: LogEntry[] = [
  {
    id: 'log1',
    timestamp: '2024-12-23T08:45:23.456Z',
    level: 'info',
    source: 'api',
    service: 'auth-service',
    host: 'prod-api-01',
    message: 'User login successful',
    traceId: 'trace-abc123',
    spanId: 'span-def456',
    userId: 'usr_123',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    sessionId: 'sess_xyz789',
    requestId: 'req_001',
    method: 'POST',
    path: '/api/auth/login',
    statusCode: 200,
    duration: 145,
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    country: 'US',
    tags: ['auth', 'login', 'production'],
    attributes: { provider: 'email', mfa: false },
    stackTrace: null
  },
  {
    id: 'log2',
    timestamp: '2024-12-23T08:44:15.789Z',
    level: 'error',
    source: 'api',
    service: 'payment-service',
    host: 'prod-api-02',
    message: 'Payment processing failed: Card declined',
    traceId: 'trace-ghi789',
    spanId: 'span-jkl012',
    userId: 'usr_456',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    sessionId: 'sess_abc123',
    requestId: 'req_002',
    method: 'POST',
    path: '/api/payments/charge',
    statusCode: 402,
    duration: 2340,
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)',
    country: 'UK',
    tags: ['payment', 'error', 'production'],
    attributes: { amount: 99.99, currency: 'USD', error_code: 'card_declined' },
    stackTrace: 'Error: Card declined\n  at PaymentService.charge (payment.ts:45)\n  at processPayment (checkout.ts:123)'
  },
  {
    id: 'log3',
    timestamp: '2024-12-23T08:43:45.123Z',
    level: 'warn',
    source: 'worker',
    service: 'email-worker',
    host: 'prod-worker-01',
    message: 'Email delivery delayed: Rate limit reached',
    traceId: 'trace-mno345',
    spanId: null,
    userId: null,
    userName: null,
    userEmail: null,
    sessionId: null,
    requestId: 'req_003',
    method: null,
    path: null,
    statusCode: null,
    duration: 50,
    ip: null,
    userAgent: null,
    country: null,
    tags: ['email', 'rate-limit', 'production'],
    attributes: { queue_size: 1500, retry_after: 60 },
    stackTrace: null
  },
  {
    id: 'log4',
    timestamp: '2024-12-23T08:42:30.567Z',
    level: 'info',
    source: 'web',
    service: 'frontend',
    host: 'cdn-edge-us-east',
    message: 'Page view: Dashboard',
    traceId: null,
    spanId: null,
    userId: 'usr_789',
    userName: 'Bob Wilson',
    userEmail: 'bob@example.com',
    sessionId: 'sess_def456',
    requestId: null,
    method: 'GET',
    path: '/dashboard',
    statusCode: 200,
    duration: 890,
    ip: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    country: 'CA',
    tags: ['pageview', 'dashboard', 'production'],
    attributes: { referrer: '/login', load_time: 1.2 },
    stackTrace: null
  },
  {
    id: 'log5',
    timestamp: '2024-12-23T08:41:12.890Z',
    level: 'critical',
    source: 'api',
    service: 'database-service',
    host: 'prod-db-01',
    message: 'Database connection pool exhausted',
    traceId: 'trace-pqr678',
    spanId: 'span-stu901',
    userId: null,
    userName: null,
    userEmail: null,
    sessionId: null,
    requestId: 'req_004',
    method: null,
    path: null,
    statusCode: 503,
    duration: 30000,
    ip: null,
    userAgent: null,
    country: null,
    tags: ['database', 'critical', 'production', 'incident'],
    attributes: { pool_size: 100, active_connections: 100, waiting_requests: 250 },
    stackTrace: 'Error: Connection pool exhausted\n  at DatabasePool.acquire (pool.ts:89)\n  at QueryExecutor.execute (executor.ts:34)'
  },
  {
    id: 'log6',
    timestamp: '2024-12-23T08:40:00.000Z',
    level: 'debug',
    source: 'api',
    service: 'cache-service',
    host: 'prod-cache-01',
    message: 'Cache miss for key: user_profile_123',
    traceId: 'trace-vwx234',
    spanId: 'span-yza567',
    userId: 'usr_123',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    sessionId: 'sess_xyz789',
    requestId: 'req_005',
    method: null,
    path: null,
    statusCode: null,
    duration: 2,
    ip: null,
    userAgent: null,
    country: null,
    tags: ['cache', 'miss', 'production'],
    attributes: { key: 'user_profile_123', ttl: 3600 },
    stackTrace: null
  }
]

const mockPatterns: LogPattern[] = [
  { id: 'pat1', pattern: 'User login successful', count: 15420, level: 'info', firstSeen: '2024-12-01', lastSeen: '2024-12-23', trend: 'up', services: ['auth-service'] },
  { id: 'pat2', pattern: 'Payment processing failed: *', count: 342, level: 'error', firstSeen: '2024-12-15', lastSeen: '2024-12-23', trend: 'up', services: ['payment-service'] },
  { id: 'pat3', pattern: 'Database connection * exhausted', count: 12, level: 'critical', firstSeen: '2024-12-20', lastSeen: '2024-12-23', trend: 'stable', services: ['database-service'] },
  { id: 'pat4', pattern: 'Email delivery delayed: *', count: 890, level: 'warn', firstSeen: '2024-12-10', lastSeen: '2024-12-23', trend: 'down', services: ['email-worker'] },
  { id: 'pat5', pattern: 'Cache miss for key: *', count: 45000, level: 'debug', firstSeen: '2024-12-01', lastSeen: '2024-12-23', trend: 'stable', services: ['cache-service'] }
]

const mockSavedQueries: SavedQuery[] = [
  { id: 'sq1', name: 'Production Errors', query: 'level:error OR level:critical', filters: { source: ['api', 'worker'], tags: ['production'] }, createdAt: '2024-12-01', isDefault: true },
  { id: 'sq2', name: 'Auth Events', query: 'service:auth-service', filters: { tags: ['auth'] }, createdAt: '2024-12-10', isDefault: false },
  { id: 'sq3', name: 'Slow Requests', query: 'duration:>1000', filters: { source: ['api'] }, createdAt: '2024-12-15', isDefault: false },
  { id: 'sq4', name: 'Payment Failures', query: 'service:payment-service level:error', filters: {}, createdAt: '2024-12-18', isDefault: false }
]

const mockStats: LogStats = {
  totalLogs: 1250000,
  logsPerMinute: 8500,
  errorRate: 2.3,
  avgLatency: 245,
  uniqueUsers: 12500,
  uniqueSessions: 45000,
  byLevel: { debug: 450000, info: 650000, warn: 85000, error: 62000, critical: 3000 },
  bySource: { api: 780000, web: 320000, mobile: 95000, worker: 45000, cron: 8000, webhook: 2000 },
  byService: { 'auth-service': 180000, 'payment-service': 95000, 'user-service': 320000, 'email-worker': 45000, 'frontend': 420000, 'database-service': 85000, 'cache-service': 105000 },
  topErrors: [
    { message: 'Payment processing failed', count: 342 },
    { message: 'Rate limit exceeded', count: 256 },
    { message: 'Validation error', count: 189 },
    { message: 'Authentication failed', count: 145 },
    { message: 'Database timeout', count: 98 }
  ],
  timeline: [
    { time: '08:00', count: 42000, errors: 890 },
    { time: '08:10', count: 45000, errors: 920 },
    { time: '08:20', count: 48000, errors: 1050 },
    { time: '08:30', count: 52000, errors: 1100 },
    { time: '08:40', count: 47000, errors: 980 },
    { time: '08:45', count: 44000, errors: 870 }
  ]
}

interface ActivityLogsClientProps {
  initialLogs: ActivityLog[]
}

// Enhanced Competitive Upgrade Mock Data - Activity Logs Context
const mockLogsAIInsights = [
  { id: '1', type: 'warning' as const, title: 'Error Spike Detected', description: 'Error rate increased 150% in the last hour. Investigating root cause.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Errors' },
  { id: '2', type: 'info' as const, title: 'Pattern Detected', description: 'Unusual login activity from new geographic region. Review recommended.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'success' as const, title: 'System Healthy', description: 'All critical services running normally. Uptime: 99.98%', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
]

const mockLogsCollaborators = [
  { id: '1', name: 'DevOps Admin', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Platform Engineer', lastActive: 'Now' },
  { id: '2', name: 'SRE Team', avatar: '/avatars/sre.jpg', status: 'online' as const, role: 'Site Reliability', lastActive: '3m ago' },
  { id: '3', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support', lastActive: '15m ago' },
]

const mockLogsPredictions = [
  { id: '1', label: 'Error Rate', current: 2.3, target: 1.0, predicted: 1.5, confidence: 78, trend: 'down' as const },
  { id: '2', label: 'Log Volume', current: 45000, target: 50000, predicted: 48000, confidence: 85, trend: 'up' as const },
  { id: '3', label: 'Anomaly Detection', current: 94, target: 99, predicted: 97, confidence: 80, trend: 'up' as const },
]

const mockLogsActivities = [
  { id: '1', user: 'System', action: 'detected', target: 'memory spike on node-3', timestamp: '5m ago', type: 'warning' as const },
  { id: '2', user: 'DevOps Admin', action: 'acknowledged', target: 'alert #2847', timestamp: '12m ago', type: 'info' as const },
  { id: '3', user: 'SRE Team', action: 'resolved', target: 'database connection issue', timestamp: '30m ago', type: 'success' as const },
]

// Quick actions are defined inside the component to access state setters

export default function ActivityLogsClient({ initialLogs }: ActivityLogsClientProps) {
  const [activeTab, setActiveTab] = useState('logs')
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<LogSource | 'all'>('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showQueryDialog, setShowQueryDialog] = useState(false)
  const [showSearchLogsDialog, setShowSearchLogsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSetAlertDialog, setShowSetAlertDialog] = useState(false)
  const [showLiveTailDialog, setShowLiveTailDialog] = useState(false)
  const [showAddParserDialog, setShowAddParserDialog] = useState(false)
  const [showCreateAlertRuleDialog, setShowCreateAlertRuleDialog] = useState(false)
  const [showPurgeLogsDialog, setShowPurgeLogsDialog] = useState(false)
  const [showResetParsersDialog, setShowResetParsersDialog] = useState(false)
  const [showExportAllDataDialog, setShowExportAllDataDialog] = useState(false)
  const [showQueryOptionsDialog, setShowQueryOptionsDialog] = useState(false)
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  // Quick actions with proper dialog handlers
  const logsQuickActions = [
    { id: '1', label: 'Search Logs', icon: 'Search', shortcut: 'S', action: () => setShowSearchLogsDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Set Alert', icon: 'Bell', shortcut: 'A', action: () => setShowSetAlertDialog(true) },
    { id: '4', label: 'Live Tail', icon: 'Activity', shortcut: 'L', action: () => setShowLiveTailDialog(true) },
  ]
  const [timeRange, setTimeRange] = useState('1h')
  const [settingsTab, setSettingsTab] = useState('general')

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.traceId && log.traceId.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter
      const matchesSource = sourceFilter === 'all' || log.source === sourceFilter
      return matchesSearch && matchesLevel && matchesSource
    })
  }, [searchQuery, levelFilter, sourceFilter])

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'warn': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'critical': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
  }

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'debug': return <Code className="w-3 h-3" />
      case 'info': return <Info className="w-3 h-3" />
      case 'warn': return <AlertTriangle className="w-3 h-3" />
      case 'error': return <AlertCircle className="w-3 h-3" />
      case 'critical': return <XCircle className="w-3 h-3" />
    }
  }

  const getSourceIcon = (source: LogSource) => {
    switch (source) {
      case 'api': return <Server className="w-4 h-4" />
      case 'web': return <Globe className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'worker': return <Zap className="w-4 h-4" />
      case 'cron': return <Clock className="w-4 h-4" />
      case 'webhook': return <GitCommit className="w-4 h-4" />
    }
  }

  const toggleLogExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
  }

  // Handlers
  const handleExportLogs = () => {
    toast.success('Export started', {
      description: 'Activity logs are being exported'
    })
  }

  const handleClearFilters = () => {
    toast.success('Filters cleared', {
      description: 'All log filters have been reset'
    })
  }

  const handleBookmarkLog = (log: ActivityLog) => {
    toast.success('Log bookmarked', {
      description: 'Activity log has been bookmarked'
    })
  }

  const handleCreateAlert = (log: ActivityLog) => {
    toast.success('Alert created', {
      description: 'Alert rule created for this activity type'
    })
  }

  const handleRefreshLogs = () => {
    toast.success('Logs refreshed', {
      description: 'Activity logs have been refreshed'
    })
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('log_api_xxxxxxxxxxxxxxxxxx')
    toast.success('API key copied', {
      description: 'API key has been copied to clipboard'
    })
  }

  const handleCopyLog = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))
      toast.success('Log copied', {
        description: 'Log entry has been copied to clipboard'
      })
    }
  }

  const handleSaveQuery = () => {
    toast.success('Query saved', {
      description: 'Your query has been saved successfully'
    })
    setShowQueryDialog(false)
  }

  const handleSettingsAction = (action: string) => {
    toast.info(`${action} settings`, {
      description: `Opening ${action.toLowerCase()} configuration`
    })
    // Navigate to appropriate settings tab
    if (action === 'General') setSettingsTab('general')
    else if (action === 'Alerts') setSettingsTab('alerts')
    else if (action === 'Retention' || action === 'Export') setSettingsTab('archiving')
    else if (action === 'Access' || action === 'API Keys') setSettingsTab('advanced')
    else if (action === 'Webhooks' || action === 'Integrations') setSettingsTab('integrations')
  }

  const handleQueryOptions = (queryId: string) => {
    setSelectedQueryId(queryId)
    setShowQueryOptionsDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Log Explorer</h1>
                <p className="text-white/80">Datadog-level log aggregation and analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
                Datadog Level
              </span>
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isLiveMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                }`}
              >
                {isLiveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isLiveMode ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                Total Logs
              </div>
              <div className="text-2xl font-bold">{(mockStats.totalLogs / 1000000).toFixed(2)}M</div>
              <div className="text-xs text-white/60">{timeRange} window</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Logs/Min
              </div>
              <div className="text-2xl font-bold">{(mockStats.logsPerMinute / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Current rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Error Rate
              </div>
              <div className="text-2xl font-bold text-red-300">{mockStats.errorRate}%</div>
              <div className="text-xs text-white/60">{mockStats.byLevel.error + mockStats.byLevel.critical} errors</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Avg Latency
              </div>
              <div className="text-2xl font-bold">{mockStats.avgLatency}ms</div>
              <div className="text-xs text-white/60">p50 response</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <User className="w-4 h-4" />
                Users
              </div>
              <div className="text-2xl font-bold">{(mockStats.uniqueUsers / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Unique users</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Layers className="w-4 h-4" />
                Sessions
              </div>
              <div className="text-2xl font-bold">{(mockStats.uniqueSessions / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Active sessions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700">
              <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Terminal className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="patterns" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Layers className="w-4 h-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="saved" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved Views
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm dark:text-white"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="4h">Last 4 hours</option>
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
              <button
                onClick={() => setShowExportDialog(true)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            {/* Logs Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Activity Logs</h2>
                  <p className="text-slate-100">Datadog-level log aggregation and search</p>
                  <p className="text-slate-200 text-xs mt-1">Full-text search • Real-time streaming • Log correlation</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredLogs.length}</p>
                    <p className="text-slate-200 text-sm">Logs Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredLogs.filter(l => l.level === 'error').length}</p>
                    <p className="text-slate-200 text-sm">Errors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs by message, service, trace ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'all')}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm dark:text-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as LogSource | 'all')}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm dark:text-white"
                  >
                    <option value="all">All Sources</option>
                    <option value="api">API</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="worker">Worker</option>
                    <option value="cron">Cron</option>
                    <option value="webhook">Webhook</option>
                  </select>
                  <button
                    onClick={() => setShowQueryDialog(true)}
                    className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center gap-2"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    Save Query
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Quick filters:</span>
                {Object.entries(mockStats.byLevel).map(([level, count]) => (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level as LogLevel)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      levelFilter === level ? getLevelColor(level as LogLevel) : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level}: {(count / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Log Entries */}
            <div className="bg-gray-900 rounded-xl overflow-hidden font-mono text-sm">
              <div className="p-2 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400 text-xs">
                  <span>Showing {filteredLogs.length} logs</span>
                  {isLiveMode && (
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRefreshLogs}
                  className="text-gray-400 hover:text-white">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-gray-800">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="hover:bg-gray-800/50">
                      <div
                        className="p-3 flex items-start gap-3 cursor-pointer"
                        onClick={() => toggleLogExpanded(log.id)}
                      >
                        <button className="mt-0.5 text-gray-500">
                          {expandedLogs.has(log.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-gray-500 whitespace-nowrap">{formatTimestamp(log.timestamp)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-cyan-400">[{log.service}]</span>
                        <span className="text-gray-300 flex-1">{log.message}</span>
                        {log.duration && (
                          <span className="text-yellow-400">{log.duration}ms</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); setShowLogDialog(true); }}
                          className="text-gray-500 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      {expandedLogs.has(log.id) && (
                        <div className="px-12 pb-3 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-4">
                            {log.traceId && (
                              <div>
                                <span className="text-gray-500">trace_id: </span>
                                <span className="text-purple-400">{log.traceId}</span>
                              </div>
                            )}
                            {log.requestId && (
                              <div>
                                <span className="text-gray-500">request_id: </span>
                                <span className="text-purple-400">{log.requestId}</span>
                              </div>
                            )}
                            {log.userId && (
                              <div>
                                <span className="text-gray-500">user: </span>
                                <span className="text-green-400">{log.userName} ({log.userEmail})</span>
                              </div>
                            )}
                            {log.method && log.path && (
                              <div>
                                <span className="text-gray-500">endpoint: </span>
                                <span className="text-blue-400">{log.method} {log.path}</span>
                              </div>
                            )}
                            {log.statusCode && (
                              <div>
                                <span className="text-gray-500">status: </span>
                                <span className={log.statusCode < 400 ? 'text-green-400' : 'text-red-400'}>{log.statusCode}</span>
                              </div>
                            )}
                            {log.ip && (
                              <div>
                                <span className="text-gray-500">ip: </span>
                                <span className="text-gray-300">{log.ip}</span>
                              </div>
                            )}
                          </div>
                          {log.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">tags:</span>
                              {log.tags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                          {log.stackTrace && (
                            <pre className="mt-2 p-2 bg-gray-950 rounded text-red-400 overflow-x-auto">
                              {log.stackTrace}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            {/* Patterns Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Patterns</h2>
                  <p className="text-purple-100">Splunk-level pattern detection and anomaly analysis</p>
                  <p className="text-purple-200 text-xs mt-1">ML-powered grouping • Error clustering • Trend detection</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockPatterns.length}</p>
                    <p className="text-purple-200 text-sm">Patterns</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Log Patterns</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Auto-detected patterns from your logs</span>
            </div>
            <div className="space-y-3">
              {mockPatterns.map((pattern) => (
                <div key={pattern.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(pattern.level)}`}>
                        {pattern.level.toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-mono text-sm font-medium text-gray-900 dark:text-white">{pattern.pattern}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>First seen: {pattern.firstSeen}</span>
                          <span>•</span>
                          <span>Last seen: {pattern.lastSeen}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{pattern.count.toLocaleString()}</div>
                      <div className={`flex items-center justify-end gap-1 text-sm ${
                        pattern.trend === 'up' ? 'text-red-500' : pattern.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {pattern.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : pattern.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {pattern.trend}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Services:</span>
                    {pattern.services.map(service => (
                      <span key={service} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Analytics</h2>
                  <p className="text-emerald-100">Elastic-level log analytics and visualization</p>
                  <p className="text-emerald-200 text-xs mt-1">Time-series charts • Distribution analysis • Custom dashboards</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredLogs.length}</p>
                    <p className="text-emerald-200 text-sm">Total Logs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Level */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs by Level</h3>
                <div className="space-y-3">
                  {Object.entries(mockStats.byLevel).map(([level, count]) => {
                    const percentage = (count / mockStats.totalLogs) * 100
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getLevelIcon(level as LogLevel)}
                            <span className="capitalize text-gray-700 dark:text-gray-300">{level}</span>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{(count / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              level === 'debug' ? 'bg-gray-400' :
                              level === 'info' ? 'bg-blue-500' :
                              level === 'warn' ? 'bg-yellow-500' :
                              level === 'error' ? 'bg-red-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* By Source */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs by Source</h3>
                <div className="space-y-3">
                  {Object.entries(mockStats.bySource).map(([source, count]) => {
                    const percentage = (count / mockStats.totalLogs) * 100
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getSourceIcon(source as LogSource)}
                            <span className="capitalize text-gray-700 dark:text-gray-300">{source}</span>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{(count / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Errors */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Errors</h3>
                <div className="space-y-3">
                  {mockStats.topErrors.map((error, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm text-red-700 dark:text-red-400">{error.message}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">{error.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Service */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs by Service</h3>
                <div className="space-y-2">
                  {Object.entries(mockStats.byService).slice(0, 5).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{service}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(count / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Saved Views Tab */}
          <TabsContent value="saved" className="space-y-4">
            {/* Saved Queries Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Saved Queries</h2>
                  <p className="text-amber-100">Papertrail-level query management and sharing</p>
                  <p className="text-amber-200 text-xs mt-1">Reusable queries • Team sharing • Alert triggers</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSavedQueries.length}</p>
                    <p className="text-amber-200 text-sm">Saved</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Queries</h2>
              <button
                onClick={() => setShowQueryDialog(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Query
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSavedQueries.map((query) => (
                <div key={query.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{query.name}</h3>
                        {query.isDefault && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Created {query.createdAt}</p>
                    </div>
                    <button
                      onClick={() => handleQueryOptions(query.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {query.query}
                  </div>
                  <button
                    onClick={() => setSearchQuery(query.query)}
                    className="w-full px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30"
                  >
                    Run Query
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Datadog-level configuration */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Settings</h2>
                  <p className="text-blue-100">Enterprise-level log configuration and retention</p>
                  <p className="text-blue-200 text-xs mt-1">Retention policies • Alert rules • Export configs</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">30-Day Retention</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Auto-Archive</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">SIEM Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: <Settings className="w-4 h-4" />, label: 'General', color: 'text-slate-600' },
                { icon: <Bell className="w-4 h-4" />, label: 'Alerts', color: 'text-blue-600' },
                { icon: <Archive className="w-4 h-4" />, label: 'Retention', color: 'text-green-600' },
                { icon: <Download className="w-4 h-4" />, label: 'Export', color: 'text-purple-600' },
                { icon: <Shield className="w-4 h-4" />, label: 'Access', color: 'text-orange-600' },
                { icon: <Zap className="w-4 h-4" />, label: 'Webhooks', color: 'text-amber-600' },
                { icon: <Link className="w-4 h-4" />, label: 'Integrations', color: 'text-pink-600' },
                { icon: <Key className="w-4 h-4" />, label: 'API Keys', color: 'text-cyan-600' }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSettingsAction(action.label)}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:scale-105 transition-all duration-200">
                  <span className={action.color}>{action.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Sliders, label: 'General' },
                        { id: 'parsing', icon: Code, label: 'Parsing' },
                        { id: 'alerts', icon: Bell, label: 'Alerts' },
                        { id: 'archiving', icon: Archive, label: 'Archiving' },
                        { id: 'integrations', icon: Zap, label: 'Integrations' },
                        { id: 'advanced', icon: Lock, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-purple-500" />
                          General Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Log Retention Period</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">7 Days</SelectItem>
                                <SelectItem value="15d">15 Days</SelectItem>
                                <SelectItem value="30d">30 Days</SelectItem>
                                <SelectItem value="90d">90 Days</SelectItem>
                                <SelectItem value="1y">1 Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
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
                          <div className="space-y-2">
                            <Label>Default Log Level</Label>
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
                            <Label>Max Logs per Query</Label>
                            <Input type="number" defaultValue="10000" />
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Live Tail Mode</p>
                              <p className="text-sm text-muted-foreground">Stream logs in real-time</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Preserve Log Context</p>
                              <p className="text-sm text-muted-foreground">Keep surrounding log lines when filtering</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Auto-refresh Dashboard</p>
                              <p className="text-sm text-muted-foreground">Automatically update analytics</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="w-5 h-5 text-blue-500" />
                          Sampling Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Log Sampling</p>
                            <p className="text-sm text-muted-foreground">Sample logs to reduce storage costs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Sample Rate (%)</Label>
                          <div className="flex items-center gap-4">
                            <Input type="range" min="1" max="100" defaultValue="100" className="flex-1" />
                            <span className="text-sm font-medium w-12">100%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Always Keep Errors</p>
                            <p className="text-sm text-muted-foreground">Never sample error and critical logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'parsing' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-green-500" />
                          Log Parsers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Configure how logs are parsed and indexed</p>
                        <div className="space-y-3">
                          {[
                            { name: 'JSON Parser', description: 'Parse JSON formatted logs', enabled: true },
                            { name: 'Nginx Parser', description: 'Parse Nginx access logs', enabled: true },
                            { name: 'Apache Parser', description: 'Parse Apache access/error logs', enabled: false },
                            { name: 'Syslog Parser', description: 'Parse RFC 5424 syslog format', enabled: true },
                            { name: 'Custom Regex', description: 'User-defined regex patterns', enabled: true }
                          ].map(parser => (
                            <div key={parser.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{parser.name}</p>
                                  <p className="text-sm text-muted-foreground">{parser.description}</p>
                                </div>
                              </div>
                              <Switch checked={parser.enabled} />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowAddParserDialog(true)}
                          className="w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-purple-300 transition-colors">
                          <Plus className="w-4 h-4 inline-block mr-2" />
                          Add Custom Parser
                        </button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-orange-500" />
                          Field Extraction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-extract Fields</p>
                            <p className="text-sm text-muted-foreground">Automatically detect and extract fields</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Index All Fields</p>
                            <p className="text-sm text-muted-foreground">Make all extracted fields searchable</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Fields per Log</Label>
                          <Input type="number" defaultValue="100" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'alerts' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-yellow-500" />
                          Alert Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'High Error Rate', condition: 'error_rate > 5%', severity: 'critical', enabled: true },
                            { name: 'Slow Response Time', condition: 'avg(duration) > 2000ms', severity: 'warning', enabled: true },
                            { name: 'Service Down', condition: 'count(status=500) > 10/min', severity: 'critical', enabled: true },
                            { name: 'Memory Pressure', condition: 'memory_usage > 90%', severity: 'warning', enabled: false },
                            { name: 'Disk Full', condition: 'disk_usage > 95%', severity: 'critical', enabled: true }
                          ].map(rule => (
                            <div key={rule.name} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <AlertTriangle className={`w-4 h-4 ${rule.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                <div>
                                  <p className="font-medium">{rule.name}</p>
                                  <p className="text-sm text-muted-foreground font-mono">{rule.condition}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {rule.severity}
                                </Badge>
                                <Switch checked={rule.enabled} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowCreateAlertRuleDialog(true)}
                          className="w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-purple-300 transition-colors">
                          <Plus className="w-4 h-4 inline-block mr-2" />
                          Create Alert Rule
                        </button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          Notification Channels
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Email', description: 'ops-team@freeflow.io', connected: true },
                            { name: 'Slack', description: '#ops-alerts', connected: true },
                            { name: 'PagerDuty', description: 'Escalation service', connected: true },
                            { name: 'Opsgenie', description: 'On-call management', connected: false },
                            { name: 'Webhook', description: 'Custom HTTP endpoint', connected: false }
                          ].map(channel => (
                            <div key={channel.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Link2 className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{channel.name}</p>
                                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                                </div>
                              </div>
                              <Badge variant={channel.connected ? 'default' : 'outline'}>
                                {channel.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'archiving' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="w-5 h-5 text-indigo-500" />
                          Log Archiving
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Archiving</p>
                            <p className="text-sm text-muted-foreground">Archive logs to cold storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Archive After (days)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Delete After (days)</Label>
                            <Input type="number" defaultValue="365" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Compress Archives</p>
                            <p className="text-sm text-muted-foreground">Use gzip compression for storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-green-500" />
                          Storage Destinations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Amazon S3', description: 's3://freeflow-logs/archive/', connected: true },
                            { name: 'Google Cloud Storage', description: 'gs://freeflow-logs/', connected: false },
                            { name: 'Azure Blob Storage', description: 'Azure container', connected: false },
                            { name: 'Local Storage', description: '/var/log/archive/', connected: true }
                          ].map(storage => (
                            <div key={storage.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Database className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{storage.name}</p>
                                  <p className="text-sm text-muted-foreground font-mono">{storage.description}</p>
                                </div>
                              </div>
                              <Badge variant={storage.connected ? 'default' : 'secondary'}>
                                {storage.connected ? 'Active' : 'Configure'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="w-5 h-5 text-orange-500" />
                          Rehydration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Rehydration</p>
                            <p className="text-sm text-muted-foreground">Restore archived logs on demand</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Rehydration Size (GB)</Label>
                          <Input type="number" defaultValue="100" className="w-32" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-delete Rehydrated</p>
                            <p className="text-sm text-muted-foreground">Remove rehydrated logs after 7 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-blue-500" />
                          Log Sources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Docker', description: 'Container logs via daemon', enabled: true },
                            { name: 'Kubernetes', description: 'Pod and cluster logs', enabled: true },
                            { name: 'AWS CloudWatch', description: 'Import from CloudWatch Logs', enabled: true },
                            { name: 'Fluentd', description: 'Forward via Fluentd agent', enabled: false },
                            { name: 'Filebeat', description: 'Elastic Filebeat forwarder', enabled: false }
                          ].map(source => (
                            <div key={source.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Upload className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{source.name}</p>
                                  <p className="text-sm text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                              <Switch checked={source.enabled} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-500" />
                          Webhooks & Exports
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook Endpoint</Label>
                          <Input placeholder="https://your-app.com/webhooks/logs" />
                        </div>
                        <div className="space-y-2">
                          <Label>Events to Send</Label>
                          <div className="flex flex-wrap gap-2">
                            {['error', 'critical', 'alert_triggered', 'anomaly_detected'].map(event => (
                              <Badge key={event} variant="secondary" className="cursor-pointer hover:bg-purple-100">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Batch Requests</p>
                            <p className="text-sm text-muted-foreground">Group events before sending</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-green-500" />
                          Analytics Integrations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Grafana', description: 'Dashboards and visualization', connected: true },
                            { name: 'Prometheus', description: 'Metrics from logs', connected: true },
                            { name: 'OpenTelemetry', description: 'Distributed tracing', connected: false },
                            { name: 'Jaeger', description: 'Trace visualization', connected: false }
                          ].map(tool => (
                            <div key={tool.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <LineChart className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{tool.name}</p>
                                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                                </div>
                              </div>
                              <Badge variant={tool.connected ? 'default' : 'outline'}>
                                {tool.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-blue-500" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="log_api_••••••••••••••••••••" readOnly className="font-mono" />
                            <button
                              onClick={handleCopyApiKey}
                              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Requests per minute</p>
                          </div>
                          <Input type="number" defaultValue="1000" className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Query API</p>
                            <p className="text-sm text-muted-foreground">Allow external log queries</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Security & Compliance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">PII Masking</p>
                            <p className="text-sm text-muted-foreground">Automatically mask sensitive data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Encryption at Rest</p>
                            <p className="text-sm text-muted-foreground">Encrypt stored logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-muted-foreground">Log all access to logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">RBAC Enforcement</p>
                            <p className="text-sm text-muted-foreground">Role-based access control</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Purge All Logs</p>
                            <p className="text-sm text-muted-foreground">Permanently delete all log data</p>
                          </div>
                          <button
                            onClick={() => setShowPurgeLogsDialog(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Purge
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Reset All Parsers</p>
                            <p className="text-sm text-muted-foreground">Reset parsing rules to defaults</p>
                          </div>
                          <button
                            onClick={() => setShowResetParsersDialog(true)}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Reset
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Export All Data</p>
                            <p className="text-sm text-muted-foreground">Download complete log archive</p>
                          </div>
                          <button
                            onClick={() => setShowExportAllDataDialog(true)}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                          </button>
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
              insights={mockLogsAIInsights}
              title="Logs Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockLogsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockLogsPredictions}
              title="System Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockLogsActivities}
            title="System Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={logsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedLog && (
                <>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(selectedLog.level)}`}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm">{selectedLog.service}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-gray-100 font-mono">{selectedLog.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Request Info</h4>
                    <div className="space-y-2 text-sm">
                      {selectedLog.method && <div><span className="text-gray-500">Method:</span> <span className="font-mono">{selectedLog.method}</span></div>}
                      {selectedLog.path && <div><span className="text-gray-500">Path:</span> <span className="font-mono">{selectedLog.path}</span></div>}
                      {selectedLog.statusCode && <div><span className="text-gray-500">Status:</span> <span className={selectedLog.statusCode < 400 ? 'text-green-600' : 'text-red-600'}>{selectedLog.statusCode}</span></div>}
                      {selectedLog.duration && <div><span className="text-gray-500">Duration:</span> <span>{selectedLog.duration}ms</span></div>}
                      {selectedLog.ip && <div><span className="text-gray-500">IP:</span> <span className="font-mono">{selectedLog.ip}</span></div>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Context</h4>
                    <div className="space-y-2 text-sm">
                      {selectedLog.traceId && <div><span className="text-gray-500">Trace ID:</span> <span className="font-mono text-purple-600">{selectedLog.traceId}</span></div>}
                      {selectedLog.requestId && <div><span className="text-gray-500">Request ID:</span> <span className="font-mono">{selectedLog.requestId}</span></div>}
                      {selectedLog.sessionId && <div><span className="text-gray-500">Session:</span> <span className="font-mono">{selectedLog.sessionId}</span></div>}
                      <div><span className="text-gray-500">Host:</span> <span>{selectedLog.host}</span></div>
                    </div>
                  </div>
                </div>

                {selectedLog.userId && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedLog.userName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedLog.userEmail}</div>
                      </div>
                    </div>
                  </div>
                )}

                {Object.keys(selectedLog.attributes).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attributes</h4>
                    <pre className="p-4 bg-gray-900 rounded-lg text-gray-100 font-mono text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.attributes, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.stackTrace && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stack Trace</h4>
                    <pre className="p-4 bg-gray-900 rounded-lg text-red-400 font-mono text-sm overflow-x-auto">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowLogDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            <button
              onClick={handleCopyLog}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy Log
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Query Dialog */}
      <Dialog open={showQueryDialog} onOpenChange={setShowQueryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Query Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white"
                placeholder="My Saved Query"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Query</label>
              <textarea
                rows={3}
                defaultValue={searchQuery}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" className="rounded border-gray-300 text-purple-600" />
              <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">Set as default view</label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowQueryDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuery}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
              Save Query
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Logs Dialog */}
      <Dialog open={showSearchLogsDialog} onOpenChange={setShowSearchLogsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Advanced Log Search
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Query</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white font-mono"
                placeholder="level:error AND service:api-gateway"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                <Select defaultValue="1h">
                  <SelectTrigger>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Level</label>
                <Select defaultValue="all">
                  <SelectTrigger>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Filter</label>
              <Input placeholder="e.g., auth-service, payment-service" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowSearchLogsDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Search executed', { description: 'Displaying search results' })
                setShowSearchLogsDialog(false)
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Logs Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Export Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Export Format</label>
              <Select defaultValue="json">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="ndjson">NDJSON (Newline Delimited)</SelectItem>
                  <SelectItem value="parquet">Parquet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current View</SelectItem>
                  <SelectItem value="1h">Last 1 Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="includeMetadata" />
              <Label htmlFor="includeMetadata">Include metadata fields</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="compressExport" defaultChecked />
              <Label htmlFor="compressExport">Compress export (gzip)</Label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowExportDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Export started', { description: 'Your logs are being exported' })
                setShowExportDialog(false)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Alert Dialog */}
      <Dialog open={showSetAlertDialog} onOpenChange={setShowSetAlertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              Create Log Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Name</label>
              <Input placeholder="e.g., High Error Rate Alert" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <Select defaultValue="count">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Log Count</SelectItem>
                  <SelectItem value="pattern">Pattern Match</SelectItem>
                  <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold</label>
                <Input type="number" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Window</label>
                <Select defaultValue="5m">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 minute</SelectItem>
                    <SelectItem value="5m">5 minutes</SelectItem>
                    <SelectItem value="15m">15 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
              <Select defaultValue="warning">
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowSetAlertDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Alert created', { description: 'Your alert rule has been configured' })
                setShowSetAlertDialog(false)
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Tail Dialog */}
      <Dialog open={showLiveTailDialog} onOpenChange={setShowLiveTailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Tail Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Activity className="w-4 h-4" />
                <span className="font-medium">Live streaming will begin when you start</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                View real-time logs as they arrive from your services
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Query</label>
              <Input placeholder="level:error OR level:warn" className="font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sources</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="api">API Only</SelectItem>
                  <SelectItem value="web">Web Only</SelectItem>
                  <SelectItem value="worker">Workers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="highlightErrors" defaultChecked />
              <Label htmlFor="highlightErrors">Highlight errors and warnings</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="autoScroll" defaultChecked />
              <Label htmlFor="autoScroll">Auto-scroll to new logs</Label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowLiveTailDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsLiveMode(true)
                toast.success('Live tail started', { description: 'Streaming logs in real-time' })
                setShowLiveTailDialog(false)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Live Tail
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Parser Dialog */}
      <Dialog open={showAddParserDialog} onOpenChange={setShowAddParserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-green-600" />
              Add Custom Parser
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parser Name</label>
              <Input placeholder="e.g., Custom Application Logs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regex Pattern</label>
              <Input placeholder="^(?P<timestamp>\d{4}-\d{2}-\d{2}).*" className="font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Log</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white font-mono text-sm"
                placeholder="Paste a sample log line to test your pattern..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowAddParserDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Parser created', { description: 'Custom parser has been added' })
                setShowAddParserDialog(false)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Parser
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Alert Rule Dialog */}
      <Dialog open={showCreateAlertRuleDialog} onOpenChange={setShowCreateAlertRuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              Create Alert Rule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
              <Input placeholder="e.g., Critical Error Alert" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <Input placeholder="level:critical AND service:*" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold</label>
                <Input type="number" placeholder="10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                <Select defaultValue="warning">
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
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowCreateAlertRuleDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Alert rule created', { description: 'New alert rule has been configured' })
                setShowCreateAlertRuleDialog(false)
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Rule
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purge Logs Dialog */}
      <Dialog open={showPurgeLogsDialog} onOpenChange={setShowPurgeLogsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Purge All Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Warning: This action is irreversible</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                All log data will be permanently deleted. This cannot be undone.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type &quot;DELETE ALL LOGS&quot; to confirm
              </label>
              <Input placeholder="DELETE ALL LOGS" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowPurgeLogsDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Logs purged', { description: 'All log data has been permanently deleted' })
                setShowPurgeLogsDialog(false)
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Purge All Logs
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Parsers Dialog */}
      <Dialog open={showResetParsersDialog} onOpenChange={setShowResetParsersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RefreshCw className="w-5 h-5" />
              Reset All Parsers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">This will reset all custom parsers</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                All custom parsing rules will be removed and defaults will be restored.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowResetParsersDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Parsers reset', { description: 'All parsers have been reset to defaults' })
                setShowResetParsersDialog(false)
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Parsers
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export All Data Dialog */}
      <Dialog open={showExportAllDataDialog} onOpenChange={setShowExportAllDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export All Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Archive className="w-4 h-4" />
                <span className="font-medium">Complete Log Archive Export</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                This will export all historical log data. The process may take several minutes.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Export Format</label>
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
            <div className="flex items-center gap-2">
              <Switch id="compressArchive" defaultChecked />
              <Label htmlFor="compressArchive">Compress archive (recommended)</Label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowExportAllDataDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success('Export started', { description: 'Complete log archive export has begun' })
                setShowExportAllDataDialog(false)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Start Export
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Query Options Dialog */}
      <Dialog open={showQueryOptionsDialog} onOpenChange={setShowQueryOptionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5 text-purple-600" />
              Query Options
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <button
              onClick={() => {
                toast.success('Query duplicated', { description: 'Query has been duplicated' })
                setShowQueryOptionsDialog(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
            >
              <Copy className="w-4 h-4 text-gray-500" />
              <span>Duplicate Query</span>
            </button>
            <button
              onClick={() => {
                toast.success('Query shared', { description: 'Share link copied to clipboard' })
                setShowQueryOptionsDialog(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
            >
              <Link className="w-4 h-4 text-gray-500" />
              <span>Share Query</span>
            </button>
            <button
              onClick={() => {
                toast.info('Editing query', { description: 'Opening query editor' })
                setShowQueryOptionsDialog(false)
                setShowQueryDialog(true)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Edit Query</span>
            </button>
            <button
              onClick={() => {
                toast.success('Query deleted', { description: 'Query has been removed' })
                setShowQueryOptionsDialog(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Query</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
