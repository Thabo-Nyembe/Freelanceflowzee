'use client'

import { useState, useMemo } from 'react'
import { useAuditEvents, useComplianceChecks, type AuditEvent, type AuditAction, type ComplianceCheck } from '@/lib/hooks/use-audit-events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Shield,
  FileText,
  Users,
  Lock,
  Eye,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Database,
  Activity,
  Bell,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  AlertTriangle,
  XCircle,
  Info,
  Zap,
  Calendar,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Network,
  Key,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Save,
  Share,
  BookOpen,
  Layout,
  Layers,
  Target,
  Timer,
  History,
  Bookmark,
  Star,
  MoreHorizontal
} from 'lucide-react'

// Splunk-level types
type EventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type EventStatus = 'success' | 'failure' | 'warning' | 'pending'
type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed'
type AlertPriority = 'low' | 'medium' | 'high' | 'critical'
type TimeRange = '15m' | '1h' | '4h' | '24h' | '7d' | '30d' | 'custom'

interface LogEvent extends AuditEvent {
  source: string
  sourcetype: string
  host: string
  index: string
  raw: string
  fields: Record<string, string>
  lineNumber?: number
}

interface Alert {
  id: string
  name: string
  description: string
  query: string
  condition: string
  priority: AlertPriority
  status: AlertStatus
  triggeredAt: string
  acknowledgedBy?: string
  eventCount: number
  lastTriggered: string
  schedule: string
  actions: string[]
}

interface SavedSearch {
  id: string
  name: string
  description: string
  query: string
  timeRange: TimeRange
  schedule?: string
  isScheduled: boolean
  lastRun?: string
  owner: string
  shared: boolean
  starred: boolean
}

interface Dashboard {
  id: string
  name: string
  description: string
  panels: DashboardPanel[]
  owner: string
  shared: boolean
  lastModified: string
}

interface DashboardPanel {
  id: string
  title: string
  type: 'chart' | 'table' | 'single_value' | 'map' | 'timeline'
  query: string
  position: { x: number; y: number; w: number; h: number }
}

interface Report {
  id: string
  name: string
  description: string
  query: string
  schedule: string
  format: 'pdf' | 'csv' | 'html'
  recipients: string[]
  lastGenerated?: string
  nextRun: string
  status: 'active' | 'paused' | 'failed'
}

interface FieldStats {
  field: string
  count: number
  distinctValues: number
  topValues: { value: string; count: number; percent: number }[]
}

interface AuditClientProps {
  initialEvents: AuditEvent[]
  initialComplianceChecks: ComplianceCheck[]
}

// Mock enhanced data
const mockLogEvents: LogEvent[] = [
  {
    id: '1',
    action: 'access',
    resource: 'user_data',
    resource_id: 'user_12345',
    actor_id: 'admin_001',
    actor_email: 'admin@company.com',
    actor_ip_address: '192.168.1.100',
    event_timestamp: new Date().toISOString(),
    severity: 'info',
    status: 'success',
    changes: {},
    source: 'web_app',
    sourcetype: 'access_log',
    host: 'web-server-01',
    index: 'main',
    raw: '2024-01-15 10:23:45 INFO admin@company.com accessed user_data user_12345',
    fields: { user_agent: 'Chrome/120', session_id: 'sess_abc123' }
  },
  {
    id: '2',
    action: 'update',
    resource: 'settings',
    resource_id: 'sys_config',
    actor_id: 'admin_002',
    actor_email: 'security@company.com',
    actor_ip_address: '192.168.1.105',
    event_timestamp: new Date(Date.now() - 300000).toISOString(),
    severity: 'high',
    status: 'success',
    changes: { mfa_required: { old: false, new: true } },
    source: 'admin_console',
    sourcetype: 'config_change',
    host: 'admin-server-01',
    index: 'security',
    raw: '2024-01-15 10:18:45 WARN security@company.com updated settings sys_config mfa_required=true',
    fields: { change_type: 'security_policy' }
  },
  {
    id: '3',
    action: 'delete',
    resource: 'api_key',
    resource_id: 'key_xyz789',
    actor_id: 'dev_003',
    actor_email: 'developer@company.com',
    actor_ip_address: '10.0.0.50',
    event_timestamp: new Date(Date.now() - 600000).toISOString(),
    severity: 'medium',
    status: 'success',
    changes: {},
    source: 'api_gateway',
    sourcetype: 'api_audit',
    host: 'api-server-02',
    index: 'api',
    raw: '2024-01-15 10:13:45 INFO developer@company.com deleted api_key key_xyz789',
    fields: { key_type: 'service_account' }
  },
  {
    id: '4',
    action: 'create',
    resource: 'user',
    resource_id: 'user_67890',
    actor_id: 'hr_001',
    actor_email: 'hr@company.com',
    actor_ip_address: '192.168.1.200',
    event_timestamp: new Date(Date.now() - 900000).toISOString(),
    severity: 'low',
    status: 'success',
    changes: {},
    source: 'hr_system',
    sourcetype: 'user_management',
    host: 'hr-server-01',
    index: 'main',
    raw: '2024-01-15 10:08:45 INFO hr@company.com created user user_67890',
    fields: { department: 'Engineering', role: 'Developer' }
  },
  {
    id: '5',
    action: 'access',
    resource: 'financial_report',
    resource_id: 'report_q4_2024',
    actor_id: 'exec_001',
    actor_email: 'cfo@company.com',
    actor_ip_address: '192.168.1.10',
    event_timestamp: new Date(Date.now() - 1200000).toISOString(),
    severity: 'info',
    status: 'success',
    changes: {},
    source: 'reporting_service',
    sourcetype: 'report_access',
    host: 'report-server-01',
    index: 'finance',
    raw: '2024-01-15 10:03:45 INFO cfo@company.com accessed financial_report report_q4_2024',
    fields: { report_type: 'quarterly', classification: 'confidential' }
  }
]

const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    name: 'Multiple Failed Logins',
    description: 'Detects more than 5 failed login attempts within 10 minutes',
    query: 'action=login status=failure | stats count by actor_email | where count > 5',
    condition: 'count > 5',
    priority: 'high',
    status: 'active',
    triggeredAt: new Date(Date.now() - 1800000).toISOString(),
    eventCount: 12,
    lastTriggered: new Date(Date.now() - 1800000).toISOString(),
    schedule: '*/5 * * * *',
    actions: ['email', 'slack', 'pagerduty']
  },
  {
    id: 'alert_2',
    name: 'Privileged Access Outside Hours',
    description: 'Admin access detected outside business hours (6 PM - 8 AM)',
    query: 'role=admin action=access | where hour < 8 OR hour > 18',
    condition: 'any match',
    priority: 'critical',
    status: 'acknowledged',
    triggeredAt: new Date(Date.now() - 7200000).toISOString(),
    acknowledgedBy: 'security@company.com',
    eventCount: 3,
    lastTriggered: new Date(Date.now() - 7200000).toISOString(),
    schedule: '0 * * * *',
    actions: ['email', 'sms']
  },
  {
    id: 'alert_3',
    name: 'Mass Data Export',
    description: 'Large data export detected (>1000 records)',
    query: 'action=export | where record_count > 1000',
    condition: 'record_count > 1000',
    priority: 'medium',
    status: 'resolved',
    triggeredAt: new Date(Date.now() - 86400000).toISOString(),
    eventCount: 1,
    lastTriggered: new Date(Date.now() - 86400000).toISOString(),
    schedule: '*/15 * * * *',
    actions: ['email']
  },
  {
    id: 'alert_4',
    name: 'API Rate Limit Exceeded',
    description: 'API calls exceeding rate limit threshold',
    query: 'sourcetype=api_audit | stats count by api_key | where count > 1000',
    condition: 'requests > 1000/min',
    priority: 'low',
    status: 'suppressed',
    triggeredAt: new Date(Date.now() - 172800000).toISOString(),
    eventCount: 45,
    lastTriggered: new Date(Date.now() - 172800000).toISOString(),
    schedule: '*/1 * * * *',
    actions: ['webhook']
  }
]

const mockSavedSearches: SavedSearch[] = [
  {
    id: 'search_1',
    name: 'Failed Login Attempts',
    description: 'All failed authentication events',
    query: 'action=login status=failure',
    timeRange: '24h',
    isScheduled: true,
    schedule: '0 */6 * * *',
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    owner: 'security@company.com',
    shared: true,
    starred: true
  },
  {
    id: 'search_2',
    name: 'High Severity Events',
    description: 'Events with high or critical severity',
    query: 'severity IN (high, critical)',
    timeRange: '4h',
    isScheduled: false,
    owner: 'admin@company.com',
    shared: true,
    starred: false
  },
  {
    id: 'search_3',
    name: 'Configuration Changes',
    description: 'All system configuration modifications',
    query: 'action=update resource=settings OR resource=config',
    timeRange: '7d',
    isScheduled: true,
    schedule: '0 8 * * *',
    lastRun: new Date(Date.now() - 28800000).toISOString(),
    owner: 'admin@company.com',
    shared: false,
    starred: true
  },
  {
    id: 'search_4',
    name: 'User Provisioning Activity',
    description: 'User creation, modification, and deletion',
    query: 'resource=user action IN (create, update, delete)',
    timeRange: '30d',
    isScheduled: false,
    owner: 'hr@company.com',
    shared: true,
    starred: false
  }
]

const mockReports: Report[] = [
  {
    id: 'report_1',
    name: 'Weekly Security Summary',
    description: 'Comprehensive security events overview',
    query: 'severity IN (medium, high, critical) | stats count by action, severity',
    schedule: '0 8 * * 1',
    format: 'pdf',
    recipients: ['security@company.com', 'ciso@company.com'],
    lastGenerated: new Date(Date.now() - 604800000).toISOString(),
    nextRun: new Date(Date.now() + 259200000).toISOString(),
    status: 'active'
  },
  {
    id: 'report_2',
    name: 'Daily Compliance Report',
    description: 'Daily compliance check results',
    query: 'index=compliance | stats count by check_name, status',
    schedule: '0 6 * * *',
    format: 'html',
    recipients: ['compliance@company.com'],
    lastGenerated: new Date(Date.now() - 86400000).toISOString(),
    nextRun: new Date(Date.now() + 43200000).toISOString(),
    status: 'active'
  },
  {
    id: 'report_3',
    name: 'Monthly Access Audit',
    description: 'Monthly user access patterns and anomalies',
    query: 'action=access | stats count by actor_email, resource | sort -count',
    schedule: '0 0 1 * *',
    format: 'csv',
    recipients: ['audit@company.com', 'security@company.com'],
    lastGenerated: new Date(Date.now() - 2592000000).toISOString(),
    nextRun: new Date(Date.now() + 604800000).toISOString(),
    status: 'active'
  }
]

const mockFieldStats: FieldStats[] = [
  {
    field: 'action',
    count: 15234,
    distinctValues: 4,
    topValues: [
      { value: 'access', count: 8542, percent: 56.1 },
      { value: 'update', count: 3821, percent: 25.1 },
      { value: 'create', count: 2156, percent: 14.2 },
      { value: 'delete', count: 715, percent: 4.7 }
    ]
  },
  {
    field: 'severity',
    count: 15234,
    distinctValues: 5,
    topValues: [
      { value: 'info', count: 9140, percent: 60.0 },
      { value: 'low', count: 3047, percent: 20.0 },
      { value: 'medium', count: 2285, percent: 15.0 },
      { value: 'high', count: 610, percent: 4.0 },
      { value: 'critical', count: 152, percent: 1.0 }
    ]
  },
  {
    field: 'source',
    count: 15234,
    distinctValues: 8,
    topValues: [
      { value: 'web_app', count: 6094, percent: 40.0 },
      { value: 'api_gateway', count: 4570, percent: 30.0 },
      { value: 'admin_console', count: 2285, percent: 15.0 },
      { value: 'mobile_app', count: 1523, percent: 10.0 }
    ]
  }
]

export default function AuditClient({ initialEvents, initialComplianceChecks }: AuditClientProps) {
  const [activeTab, setActiveTab] = useState('events')
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<LogEvent | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null)
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [showCreateSearch, setShowCreateSearch] = useState(false)

  const { auditEvents, loading } = useAuditEvents({ action: selectedAction })
  const { complianceChecks } = useComplianceChecks()

  const displayEvents = useMemo(() => {
    const events = auditEvents.length > 0 ? auditEvents : initialEvents
    return events.map((e, i) => ({
      ...e,
      source: mockLogEvents[i % mockLogEvents.length]?.source || 'unknown',
      sourcetype: mockLogEvents[i % mockLogEvents.length]?.sourcetype || 'generic',
      host: mockLogEvents[i % mockLogEvents.length]?.host || 'server-01',
      index: mockLogEvents[i % mockLogEvents.length]?.index || 'main',
      raw: `${new Date(e.event_timestamp).toISOString()} ${e.severity?.toUpperCase()} ${e.actor_email} ${e.action} ${e.resource} ${e.resource_id}`,
      fields: mockLogEvents[i % mockLogEvents.length]?.fields || {}
    })) as LogEvent[]
  }, [auditEvents, initialEvents])

  const displayChecks = complianceChecks.length > 0 ? complianceChecks : initialComplianceChecks

  // Stats calculations
  const totalEvents = displayEvents.length
  const criticalCount = displayEvents.filter(e => e.severity === 'critical').length
  const highCount = displayEvents.filter(e => e.severity === 'high').length
  const failureCount = displayEvents.filter(e => e.status === 'failure').length
  const uniqueActors = [...new Set(displayEvents.map(e => e.actor_email))].length
  const uniqueHosts = [...new Set(displayEvents.map(e => e.host))].length
  const avgComplianceScore = displayChecks.length > 0
    ? displayChecks.reduce((sum, c) => sum + c.score, 0) / displayChecks.length
    : 0

  const activeAlerts = mockAlerts.filter(a => a.status === 'active').length

  const filteredEvents = useMemo(() => {
    return displayEvents.filter(event => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          event.raw.toLowerCase().includes(query) ||
          event.actor_email.toLowerCase().includes(query) ||
          event.resource.toLowerCase().includes(query) ||
          event.action.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [displayEvents, searchQuery])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'failure': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'warning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'passing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'failing': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getAlertStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'suppressed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4" />
      case 'update': return <Edit className="w-4 h-4" />
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'access': return <Eye className="w-4 h-4" />
      case 'login': return <LogIn className="w-4 h-4" />
      case 'logout': return <LogOut className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              Audit & SIEM Console
            </h1>
            <p className="text-slate-400">Security Information and Event Management • Splunk-Level Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isStreaming ? "destructive" : "default"}
              onClick={() => setIsStreaming(!isStreaming)}
              className="gap-2"
            >
              {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isStreaming ? 'Pause Stream' : 'Live Stream'}
            </Button>
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Total Events</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalEvents.toLocaleString()}</p>
              <p className="text-xs text-green-400">+12.5% from last period</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">Critical</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-xs text-slate-500">Requires attention</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">High Severity</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">{highCount}</p>
              <p className="text-xs text-slate-500">Monitor closely</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">Failures</span>
              </div>
              <p className="text-2xl font-bold text-white">{failureCount}</p>
              <p className="text-xs text-red-400">-8.3% from average</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">Unique Actors</span>
              </div>
              <p className="text-2xl font-bold text-white">{uniqueActors}</p>
              <p className="text-xs text-slate-500">Active users</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Hosts</span>
              </div>
              <p className="text-2xl font-bold text-white">{uniqueHosts}</p>
              <p className="text-xs text-slate-500">Monitored servers</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-slate-400">Active Alerts</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{activeAlerts}</p>
              <p className="text-xs text-slate-500">Needs review</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Compliance</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{avgComplianceScore.toFixed(0)}%</p>
              <p className="text-xs text-green-400">+5.2% improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search: action=login status=failure | stats count by actor_email | sort -count'
                  className="pl-10 bg-slate-900 border-slate-600 text-white font-mono placeholder:text-slate-500"
                />
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-white"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="4h">Last 4 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="events" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Database className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
              {activeAlerts > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{activeAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="searches" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Searches
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-slate-700 text-slate-300">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-slate-700 text-slate-300">
              <CheckCircle className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Event List */}
              <div className="lg:col-span-3 space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Event Stream
                        {isStreaming && (
                          <span className="flex items-center gap-1 text-sm text-green-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Live
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {filteredEvents.length} events
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-2">
                        {filteredEvents.slice(0, 50).map((event, idx) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-green-500/50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                event.severity === 'critical' ? 'bg-red-500/20' :
                                event.severity === 'high' ? 'bg-orange-500/20' :
                                event.severity === 'medium' ? 'bg-yellow-500/20' :
                                'bg-blue-500/20'
                              }`}>
                                {getActionIcon(event.action)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-slate-500 font-mono">
                                    {new Date(event.event_timestamp).toLocaleTimeString()}
                                  </span>
                                  <Badge className={getSeverityColor(event.severity || 'info')} variant="secondary">
                                    {event.severity}
                                  </Badge>
                                  <Badge className={getStatusColor(event.status)} variant="secondary">
                                    {event.status}
                                  </Badge>
                                  <span className="text-xs text-slate-500">{event.source}</span>
                                </div>
                                <p className="text-sm text-white font-mono truncate">{event.raw}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {event.actor_email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Server className="w-3 h-3" />
                                    {event.host}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {event.actor_ip_address}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Field Sidebar */}
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Field Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockFieldStats.map((field) => (
                        <div key={field.field}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{field.field}</span>
                            <span className="text-xs text-slate-500">{field.distinctValues} values</span>
                          </div>
                          <div className="space-y-1">
                            {field.topValues.slice(0, 4).map((val) => (
                              <div key={val.value} className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    style={{ width: `${val.percent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-20 truncate">{val.value}</span>
                                <span className="text-xs text-slate-500 w-12 text-right">{val.percent}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Timer className="w-4 h-4 text-cyan-400" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['00:00', '06:00', '12:00', '18:00'].map((time, idx) => (
                        <div key={time} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-12">{time}</span>
                          <div className="flex-1 h-6 bg-slate-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500/50 to-emerald-500/50"
                              style={{ width: `${20 + idx * 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Alert Rules</h3>
                  <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowCreateAlert(true)}>
                    <Plus className="w-4 h-4" />
                    Create Alert
                  </Button>
                </div>

                <div className="space-y-3">
                  {mockAlerts.map((alert) => (
                    <Card
                      key={alert.id}
                      className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-white">{alert.name}</h4>
                              <Badge className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                              <Badge className={getAlertStatusColor(alert.status)}>{alert.status}</Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{alert.description}</p>
                            <code className="text-xs bg-slate-900 px-2 py-1 rounded text-green-400 font-mono">
                              {alert.query}
                            </code>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(alert.lastTriggered)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {alert.eventCount} events
                              </span>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                {alert.schedule}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Alert Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Active</span>
                        <Badge className="bg-red-500 text-white">
                          {mockAlerts.filter(a => a.status === 'active').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Acknowledged</span>
                        <Badge className="bg-yellow-500 text-black">
                          {mockAlerts.filter(a => a.status === 'acknowledged').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Resolved</span>
                        <Badge className="bg-green-500 text-white">
                          {mockAlerts.filter(a => a.status === 'resolved').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Suppressed</span>
                        <Badge className="bg-slate-500 text-white">
                          {mockAlerts.filter(a => a.status === 'suppressed').length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Alert Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['email', 'slack', 'pagerduty', 'webhook', 'sms'].map((action) => (
                        <div key={action} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                          <span className="text-sm text-white capitalize">{action}</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {mockAlerts.filter(a => a.actions.includes(action)).length} alerts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Saved Searches Tab */}
          <TabsContent value="searches" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Saved Searches</h3>
                <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowCreateSearch(true)}>
                  <Plus className="w-4 h-4" />
                  Save Search
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockSavedSearches.map((search) => (
                  <Card
                    key={search.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSearch(search)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {search.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          <h4 className="font-semibold text-white">{search.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {search.shared && (
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                              <Share className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                          {search.isScheduled && (
                            <Badge variant="outline" className="border-green-600 text-green-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{search.description}</p>
                      <code className="text-xs bg-slate-900 px-2 py-1 rounded text-green-400 font-mono block truncate">
                        {search.query}
                      </code>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {search.owner}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {search.timeRange}
                        </span>
                        {search.lastRun && (
                          <span className="flex items-center gap-1">
                            <History className="w-3 h-3" />
                            {formatTimeAgo(search.lastRun)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Scheduled Reports</h3>
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockReports.map((report) => (
                  <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{report.name}</h4>
                        <Badge className={
                          report.status === 'active' ? 'bg-green-500 text-white' :
                          report.status === 'paused' ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{report.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Format</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-300 uppercase">
                            {report.format}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Schedule</span>
                          <span className="text-slate-300 font-mono">{report.schedule}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Recipients</span>
                          <span className="text-slate-300">{report.recipients.length}</span>
                        </div>
                        {report.lastGenerated && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Last Generated</span>
                            <span className="text-slate-300">{formatTimeAgo(report.lastGenerated)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Next Run</span>
                          <span className="text-green-400">{formatTimeAgo(report.nextRun)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-white">Compliance Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayChecks.map((check) => (
                    <Card key={check.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{check.check_name}</h4>
                            <Badge variant="outline" className="border-slate-600 text-slate-400 mt-1">
                              {check.framework}
                            </Badge>
                          </div>
                          <Badge className={getStatusColor(check.status)}>{check.status}</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-4xl font-bold text-white">{check.score.toFixed(0)}</span>
                            <span className="text-sm text-slate-400">/100</span>
                          </div>
                          <Progress value={check.score} className="h-2" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Issues Found</span>
                            <span className={check.issues_found > 0 ? 'text-red-400' : 'text-green-400'}>
                              {check.issues_found}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {displayChecks.length === 0 && (
                    <Card className="col-span-2 bg-slate-800/50 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">No Compliance Checks</h4>
                        <p className="text-slate-400">Configure compliance checks to monitor your security posture</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Compliance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white mb-2">{avgComplianceScore.toFixed(0)}%</div>
                        <p className="text-sm text-slate-400">Overall Compliance Score</p>
                      </div>
                      <Progress value={avgComplianceScore} className="h-3" />
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-400">
                            {displayChecks.filter(c => c.status === 'passing').length}
                          </div>
                          <p className="text-xs text-slate-500">Passing</p>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-400">
                            {displayChecks.filter(c => c.status === 'warning').length}
                          </div>
                          <p className="text-xs text-slate-500">Warning</p>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-400">
                            {displayChecks.filter(c => c.status === 'failing').length}
                          </div>
                          <p className="text-xs text-slate-500">Failing</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Frameworks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['SOC 2', 'GDPR', 'HIPAA', 'PCI DSS', 'ISO 27001'].map((framework) => (
                        <div key={framework} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                          <span className="text-sm text-white">{framework}</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {displayChecks.filter(c => c.framework === framework).length} checks
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEvent && getActionIcon(selectedEvent.action)}
                Event Details
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Full event information and raw log data
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Action</label>
                    <p className="text-white capitalize">{selectedEvent.action}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Severity</label>
                    <Badge className={getSeverityColor(selectedEvent.severity || 'info')}>
                      {selectedEvent.severity}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Status</label>
                    <Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Timestamp</label>
                    <p className="text-white">{new Date(selectedEvent.event_timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Actor</label>
                    <p className="text-white">{selectedEvent.actor_email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">IP Address</label>
                    <p className="text-white font-mono">{selectedEvent.actor_ip_address}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Resource</label>
                    <p className="text-white">{selectedEvent.resource}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Resource ID</label>
                    <p className="text-white font-mono">{selectedEvent.resource_id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Source</label>
                    <p className="text-white">{selectedEvent.source}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Host</label>
                    <p className="text-white font-mono">{selectedEvent.host}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Raw Log</label>
                  <pre className="mt-1 p-3 bg-slate-950 rounded-lg text-green-400 font-mono text-sm overflow-x-auto">
                    {selectedEvent.raw}
                  </pre>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Fields</label>
                  <div className="mt-1 p-3 bg-slate-950 rounded-lg">
                    {Object.entries(selectedEvent.fields).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="text-purple-400">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Alert Details
              </DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedAlert.name}</h3>
                  <Badge className={getPriorityColor(selectedAlert.priority)}>{selectedAlert.priority}</Badge>
                  <Badge className={getAlertStatusColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                </div>
                <p className="text-slate-400">{selectedAlert.description}</p>
                <div>
                  <label className="text-xs text-slate-500">Query</label>
                  <pre className="mt-1 p-3 bg-slate-950 rounded-lg text-green-400 font-mono text-sm">
                    {selectedAlert.query}
                  </pre>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Condition</label>
                    <p className="text-white">{selectedAlert.condition}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Schedule</label>
                    <p className="text-white font-mono">{selectedAlert.schedule}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Event Count</label>
                    <p className="text-white">{selectedAlert.eventCount}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Last Triggered</label>
                    <p className="text-white">{formatTimeAgo(selectedAlert.lastTriggered)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Actions</label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedAlert.actions.map((action) => (
                      <Badge key={action} variant="outline" className="border-slate-600 text-slate-300 capitalize">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Acknowledge</Button>
                  <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">Suppress</Button>
                  <Button variant="destructive" className="flex-1">Delete</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
