'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useAuditEvents, useComplianceChecks, type AuditEvent, type AuditAction, type ComplianceCheck } from '@/lib/hooks/use-audit-events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Shield,
  FileText,
  Users,
  Lock,
  Eye,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Database,
  Activity,
  Bell,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  AlertTriangle,
  XCircle,
  Zap,
  Calendar,
  Globe,
  Server,
  HardDrive,
  Key,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Share,
  Layers,
  Timer,
  History,
  Bookmark,
  Star,
  MoreHorizontal,
  Sliders,
  Webhook,
  Mail,
  Copy,
  Archive
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

// Import mock data from centralized adapters



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

// Competitive Upgrade Mock Data - Splunk-level Audit Intelligence
const mockAuditAIInsights = [
  { id: '1', type: 'success' as const, title: 'Compliance Score', description: 'All systems passing SOC2 audit requirements!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '2', type: 'warning' as const, title: 'Anomaly Detected', description: 'Unusual login pattern from IP 192.168.1.x - review recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'AI Pattern', description: 'Similar audit events clustered - possible automation opportunity.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockAuditCollaborators = [
  { id: '1', name: 'Audit Lead', avatar: '/avatars/audit.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Compliance Officer', avatar: '/avatars/compliance.jpg', status: 'online' as const, role: 'Officer' },
  { id: '3', name: 'Security Analyst', avatar: '/avatars/security.jpg', status: 'away' as const, role: 'Analyst' },
]

const mockAuditPredictions = [
  { id: '1', title: 'Audit Completion', prediction: 'Q1 audit will complete 2 days ahead of schedule', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Risk Reduction', prediction: 'Implementing recommendations will reduce risk score by 25%', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockAuditActivities = [
  { id: '1', user: 'Audit Lead', action: 'Completed', target: 'access control review', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Compliance Officer', action: 'Flagged', target: 'policy exception', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Security Analyst', action: 'Investigated', target: 'failed login attempts', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockAuditQuickActions = [
  { id: '1', label: 'Run Audit', icon: 'play', action: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Starting audit...', success: 'Audit running - Scanning for compliance issues', error: 'Audit failed to start' }), variant: 'default' as const },
  { id: '2', label: 'Export', icon: 'download', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Exporting report...', success: 'Export complete - Report downloaded', error: 'Export failed' }), variant: 'outline' as const },
  { id: '3', label: 'Schedule', icon: 'calendar', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening scheduler...', success: 'Scheduler ready - Configure audit schedule', error: 'Failed to open scheduler' }), variant: 'default' as const },
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
  const [settingsTab, setSettingsTab] = useState('general')

  const { auditEvents, loading } = useAuditEvents({ action: selectedAction })
  const { complianceChecks } = useComplianceChecks()

  const displayEvents = useMemo(() => {
    const events = (auditEvents?.length || 0) > 0 ? auditEvents : (initialEvents || [])
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

  const displayChecks = (complianceChecks || []).length > 0 ? complianceChecks : (initialComplianceChecks || [])

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

  // Handlers
  const handleRunAudit = () => toast.info('Running', { description: 'Audit started...' })
  const handleExportAudit = () => toast.success('Exporting', { description: 'Report downloading...' })
  const handleScheduleAudit = () => toast.info('Schedule', { description: 'Opening scheduler...' })
  const handleResolveIssue = (id: string) => toast.success('Resolved', { description: `Issue #${id} resolved` })
  const handleRefresh = () => {
    toast.info('Refreshing', { description: 'Fetching latest events...' })
  }
  const handleSettings = () => {
    toast.info('Settings', { description: 'Opening settings panel...' })
  }
  const handleSearch = () => {
    toast.info('Searching', { description: 'Executing search query...' })
  }
  const handleQuickAction = (label: string) => {
    toast.info(label, { description: `${label} action initiated` })
  }
  const handleCreateReport = () => {
    toast.success('Create Report', { description: 'Opening report builder...' })
  }
  const handleDownloadReport = (reportName: string) => {
    toast.success('Downloading', { description: `Downloading ${reportName}...` })
  }
  const handleRunReport = (reportName: string) => {
    toast.info('Running Report', { description: `Generating ${reportName}...` })
  }
  const handleSaveSettings = () => {
    toast.success('Settings Saved', { description: 'Retention settings updated' })
  }
  const handleIntegrationAction = (name: string, status: string) => {
    toast.info(status === 'connected' ? 'Configure' : 'Connect', { description: `${status === 'connected' ? 'Configuring' : 'Connecting'} ${name}...` })
  }
  const handleCopyApiKey = () => {
    toast.success('Copied', { description: 'API key copied to clipboard' })
  }
  const handleRegenerateApiKey = () => {
    toast.info('Regenerating', { description: 'Generating new API key...' })
  }
  const handleExportAllData = () => {
    toast.info('Exporting', { description: 'Preparing full data export...' })
  }
  const handleClearCache = () => {
    toast.success('Cache Cleared', { description: 'All cached data has been cleared' })
  }
  const handleResetSettings = () => {
    toast.info('Resetting', { description: 'Restoring default settings...' })
  }
  const handleDeleteAllData = () => {
    toast.error('Delete All Data', { description: 'This action requires confirmation' })
  }
  const handleAcknowledgeAlert = () => {
    toast.success('Alert Acknowledged', { description: 'Alert has been acknowledged' })
  }
  const handleSuppressAlert = () => {
    toast.info('Alert Suppressed', { description: 'Alert notifications suppressed' })
  }
  const handleDeleteAlert = () => {
    toast.error('Alert Deleted', { description: 'Alert has been removed' })
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
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handleExportAudit}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handleSettings}>
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
              <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={handleSearch}>
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
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 text-slate-300">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6 space-y-6">
            {/* Events Banner */}
            <Card className="border-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Database className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Security Event Stream</h3>
                      <p className="text-white/80">Real-time security information and event management</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
                      <p className="text-sm text-white/80">Total Events</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{criticalCount + highCount}</p>
                      <p className="text-sm text-white/80">High Priority</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{uniqueActors}</p>
                      <p className="text-sm text-white/80">Unique Actors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Play, label: 'Run Audit', color: 'bg-green-500', handler: handleRunAudit },
                { icon: Download, label: 'Export', color: 'bg-orange-500', handler: handleExportAudit },
                { icon: Calendar, label: 'Schedule', color: 'bg-blue-500', handler: handleScheduleAudit },
                { icon: RefreshCw, label: 'Refresh', color: 'bg-purple-500', handler: handleRefresh },
                { icon: Bell, label: 'Alerts', color: 'bg-pink-500', handler: () => handleQuickAction('Alerts') },
                { icon: Bookmark, label: 'Save Search', color: 'bg-indigo-500', handler: () => handleQuickAction('Save Search') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-teal-500', handler: () => handleQuickAction('Analytics') },
                { icon: Terminal, label: 'Query', color: 'bg-gray-500', handler: () => handleQuickAction('Query') }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                  onClick={action.handler}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

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
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleRefresh}>
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
          <TabsContent value="alerts" className="mt-6 space-y-6">
            {/* Alerts Banner */}
            <Card className="border-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bell className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Alert Management</h3>
                      <p className="text-white/80">Configure and monitor security alerts</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'active').length}</p>
                      <p className="text-sm text-white/80">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockAlerts.filter(a => a.priority === 'critical' || a.priority === 'high').length}</p>
                      <p className="text-sm text-white/80">Critical/High</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockAlerts.length}</p>
                      <p className="text-sm text-white/80">Total Rules</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Create Alert', color: 'bg-green-500' },
                { icon: Bell, label: 'Active Alerts', color: 'bg-red-500' },
                { icon: CheckCircle, label: 'Acknowledge', color: 'bg-blue-500' },
                { icon: XCircle, label: 'Suppress', color: 'bg-orange-500' },
                { icon: History, label: 'History', color: 'bg-purple-500' },
                { icon: Mail, label: 'Notifications', color: 'bg-pink-500' },
                { icon: Webhook, label: 'Webhooks', color: 'bg-indigo-500' },
                { icon: Settings, label: 'Configure', color: 'bg-gray-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

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
          <TabsContent value="searches" className="mt-6 space-y-6">
            {/* Saved Searches Banner */}
            <Card className="border-0 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bookmark className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Saved Searches</h3>
                      <p className="text-white/80">Quick access to your frequently used queries</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockSavedSearches.length}</p>
                      <p className="text-sm text-white/80">Total Searches</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockSavedSearches.filter(s => s.isScheduled).length}</p>
                      <p className="text-sm text-white/80">Scheduled</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockSavedSearches.filter(s => s.starred).length}</p>
                      <p className="text-sm text-white/80">Starred</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Searches Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Save Search', color: 'bg-green-500' },
                { icon: Star, label: 'Starred', color: 'bg-yellow-500' },
                { icon: Clock, label: 'Scheduled', color: 'bg-blue-500' },
                { icon: Share, label: 'Shared', color: 'bg-purple-500' },
                { icon: Play, label: 'Run Search', color: 'bg-orange-500' },
                { icon: Copy, label: 'Duplicate', color: 'bg-pink-500' },
                { icon: Download, label: 'Export', color: 'bg-indigo-500' },
                { icon: Trash2, label: 'Delete', color: 'bg-red-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

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
          <TabsContent value="reports" className="mt-6 space-y-6">
            {/* Reports Banner */}
            <Card className="border-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Scheduled Reports</h3>
                      <p className="text-white/80">Automated reporting and distribution</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockReports.length}</p>
                      <p className="text-sm text-white/80">Total Reports</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockReports.filter(r => r.status === 'active').length}</p>
                      <p className="text-sm text-white/80">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockReports.reduce((sum, r) => sum + r.recipients.length, 0)}</p>
                      <p className="text-sm text-white/80">Recipients</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Create Report', color: 'bg-green-500' },
                { icon: Play, label: 'Run Now', color: 'bg-blue-500' },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-500' },
                { icon: Download, label: 'Download', color: 'bg-orange-500' },
                { icon: Mail, label: 'Email Report', color: 'bg-pink-500' },
                { icon: Copy, label: 'Duplicate', color: 'bg-indigo-500' },
                { icon: Archive, label: 'Archive', color: 'bg-teal-500' },
                { icon: Trash2, label: 'Delete', color: 'bg-red-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Scheduled Reports</h3>
                <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={handleCreateReport}>
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
                        <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => handleDownloadReport(report.name)}>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => handleRunReport(report.name)}>
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
          <TabsContent value="compliance" className="mt-6 space-y-6">
            {/* Compliance Banner */}
            <Card className="border-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Compliance Dashboard</h3>
                      <p className="text-white/80">Monitor regulatory compliance and security posture</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{avgComplianceScore.toFixed(0)}%</p>
                      <p className="text-sm text-white/80">Overall Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{displayChecks.filter(c => c.status === 'passing').length}</p>
                      <p className="text-sm text-white/80">Passing</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{displayChecks.filter(c => c.status === 'failing').length}</p>
                      <p className="text-sm text-white/80">Failing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Play, label: 'Run Audit', color: 'bg-green-500', handler: handleRunAudit },
                { icon: Download, label: 'Export', color: 'bg-indigo-500', handler: handleExportAudit },
                { icon: Calendar, label: 'Schedule', color: 'bg-blue-500', handler: handleScheduleAudit },
                { icon: CheckCircle, label: 'Resolve Issue', color: 'bg-teal-500', handler: () => handleResolveIssue('1') },
                { icon: Shield, label: 'Frameworks', color: 'bg-purple-500', handler: () => handleQuickAction('Frameworks') },
                { icon: AlertTriangle, label: 'Issues', color: 'bg-red-500', handler: () => handleQuickAction('Issues') },
                { icon: History, label: 'History', color: 'bg-pink-500', handler: () => handleQuickAction('History') },
                { icon: Settings, label: 'Configure', color: 'bg-gray-500', handler: () => handleQuickAction('Configure') }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                  onClick={action.handler}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

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

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card className="border-0 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">SIEM Settings</h3>
                      <p className="text-white/80">Configure your security monitoring preferences</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'alerts', label: 'Alerts', icon: Bell },
                        { id: 'notifications', label: 'Notifications', icon: Mail },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-green-500/20 text-green-400'
                              : 'text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-green-400" />
                          General Settings
                        </CardTitle>
                        <CardDescription className="text-slate-400">Configure basic SIEM preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-300">Default Time Range</Label>
                            <Input defaultValue="24h" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                          </div>
                          <div>
                            <Label className="text-slate-300">Events Per Page</Label>
                            <Input type="number" defaultValue="50" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Real-Time Streaming</p>
                            <p className="text-sm text-slate-500">Enable live event streaming</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Auto-Refresh</p>
                            <p className="text-sm text-slate-500">Automatically refresh event data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Dark Mode</p>
                            <p className="text-sm text-slate-500">Use dark theme for the console</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-400" />
                          Data Retention
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-slate-300">Event Retention Period (days)</Label>
                          <Input type="number" defaultValue="90" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                        <div>
                          <Label className="text-slate-300">Archive Location</Label>
                          <Input defaultValue="s3://audit-logs/archive" className="mt-1 bg-slate-900 border-slate-600 text-white font-mono" />
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveSettings}>Save Retention Settings</Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Alerts Settings */}
                {settingsTab === 'alerts' && (
                  <>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Bell className="w-5 h-5 text-yellow-400" />
                          Alert Configuration
                        </CardTitle>
                        <CardDescription className="text-slate-400">Configure alert thresholds and behaviors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Enable Critical Alerts</p>
                            <p className="text-sm text-slate-500">Receive alerts for critical severity events</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Enable High Severity Alerts</p>
                            <p className="text-sm text-slate-500">Receive alerts for high severity events</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Alert Deduplication</p>
                            <p className="text-sm text-slate-500">Combine similar alerts into single notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label className="text-slate-300">Alert Cooldown Period (minutes)</Label>
                          <Input type="number" defaultValue="15" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-orange-400" />
                          Alert Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Email', enabled: true },
                          { name: 'Slack', enabled: true },
                          { name: 'PagerDuty', enabled: false },
                          { name: 'Webhook', enabled: true }
                        ].map((action, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{action.name[0]}</span>
                              </div>
                              <span className="text-white">{action.name}</span>
                            </div>
                            <Switch defaultChecked={action.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Mail className="w-5 h-5 text-pink-400" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Daily Digest</p>
                            <p className="text-sm text-slate-500">Receive daily summary of security events</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Weekly Report</p>
                            <p className="text-sm text-slate-500">Receive weekly security report</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Instant Alerts</p>
                            <p className="text-sm text-slate-500">Receive immediate notifications for critical events</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label className="text-slate-300">Notification Recipients</Label>
                          <Input defaultValue="security@company.com, soc@company.com" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-400" />
                          SIEM Integrations
                        </CardTitle>
                        <CardDescription className="text-slate-400">Connect external security tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Slack', status: 'connected' },
                          { name: 'PagerDuty', status: 'connected' },
                          { name: 'Jira', status: 'disconnected' },
                          { name: 'ServiceNow', status: 'disconnected' }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {integration.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-white">{integration.name}</p>
                                <p className="text-sm text-slate-500">
                                  {integration.status === 'connected' ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => handleIntegrationAction(integration.name, integration.status)}>
                              {integration.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Key className="w-5 h-5 text-green-400" />
                          API Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-slate-300">API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="password" value="sk_siem_****************************" readOnly className="bg-slate-900 border-slate-600 text-white font-mono" />
                            <Button variant="outline" className="border-slate-600 text-slate-300">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-slate-300">Webhook Endpoint</Label>
                          <Input defaultValue="https://api.yoursiem.com/webhooks/events" className="mt-1 bg-slate-900 border-slate-600 text-white font-mono" />
                        </div>
                        <Button variant="outline" className="border-slate-600 text-slate-300">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-400" />
                          Access Security
                        </CardTitle>
                        <CardDescription className="text-slate-400">Configure security and access controls</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-500">Require 2FA for SIEM access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">IP Whitelisting</p>
                            <p className="text-sm text-slate-500">Restrict access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Session Timeout</p>
                            <p className="text-sm text-slate-500">Auto-logout after inactivity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Lock className="w-5 h-5 text-yellow-400" />
                          Data Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Encrypt Data at Rest</p>
                            <p className="text-sm text-slate-500">Enable AES-256 encryption for stored data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Encrypt Data in Transit</p>
                            <p className="text-sm text-slate-500">Require TLS for all connections</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Audit All Access</p>
                            <p className="text-sm text-slate-500">Log all SIEM console access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-cyan-400" />
                          Advanced Configuration
                        </CardTitle>
                        <CardDescription className="text-slate-400">Advanced settings for power users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Debug Mode</p>
                            <p className="text-sm text-slate-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Experimental Features</p>
                            <p className="text-sm text-slate-500">Enable beta features</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label className="text-slate-300">Query Timeout (seconds)</Label>
                          <Input type="number" defaultValue="30" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                        <div>
                          <Label className="text-slate-300">Max Concurrent Queries</Label>
                          <Input type="number" defaultValue="5" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-400" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">Auto-Archive Old Events</p>
                            <p className="text-sm text-slate-500">Automatically archive events older than retention period</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="border-slate-600 text-slate-300">
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-300">Reset All Settings</p>
                            <p className="text-sm text-red-400/70">Restore all settings to defaults</p>
                          </div>
                          <Button variant="outline" className="border-red-600 text-red-400">Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-300">Delete All Data</p>
                            <p className="text-sm text-red-400/70">Permanently delete all audit data</p>
                          </div>
                          <Button variant="outline" className="border-red-600 text-red-400">Delete</Button>
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
              insights={mockAuditAIInsights}
              title="Audit Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAuditCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAuditPredictions}
              title="Audit Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAuditActivities}
            title="Audit Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAuditQuickActions}
            variant="grid"
          />
        </div>

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
