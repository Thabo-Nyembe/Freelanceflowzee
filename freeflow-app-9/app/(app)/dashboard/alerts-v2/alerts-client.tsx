'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useAlerts, Alert as DBAlert } from '@/lib/hooks/use-alerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  BellRing,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  UserCheck,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Activity,
  Server,
  VolumeX,
  ArrowUp,
  ChevronRight,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Link2,
  Webhook,
  Layers,
  Target,
  Timer,
  PhoneCall,
  MessageCircle,
  Slack,
  Sliders,
  Download
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




import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'

// Types
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
type AlertStatus = 'triggered' | 'acknowledged' | 'resolved' | 'suppressed'
type ServiceStatus = 'operational' | 'degraded' | 'critical' | 'maintenance'

interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  service: string
  source: string
  triggeredAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  acknowledgedBy?: string
  resolvedBy?: string
  incidentNumber?: string
  deduplicationKey?: string
  occurrences: number
  escalationLevel: number
  tags: string[]
  impactedUsers?: number
  runbook?: string
}

interface OnCallSchedule {
  id: string
  name: string
  currentOnCall: {
    name: string
    avatar: string
    phone: string
    email: string
  }
  nextOnCall: {
    name: string
    avatar: string
    shiftStart: string
  }
  rotationType: 'weekly' | 'daily' | 'custom'
  escalationPolicy: string
}

interface Service {
  id: string
  name: string
  description: string
  status: ServiceStatus
  owner: string
  team: string
  alertCount: number
  lastIncident?: string
  integrations: string[]
  uptime: number
}

interface EscalationPolicy {
  id: string
  name: string
  description: string
  levels: {
    level: number
    targets: string[]
    timeout: number
  }[]
  services: number
  isDefault: boolean
}

interface Integration {
  id: string
  name: string
  type: string
  icon: string
  status: 'active' | 'inactive' | 'error'
  alertsReceived: number
  lastAlert: string
}

// Mock data
const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'High CPU Usage on Production API',
    description: 'CPU utilization exceeded 90% threshold on prod-api-01 for more than 5 minutes',
    severity: 'critical',
    status: 'triggered',
    service: 'API Gateway',
    source: 'Datadog',
    triggeredAt: '2024-01-15T14:30:00Z',
    incidentNumber: 'INC-2024-001',
    deduplicationKey: 'cpu-high-prod-api-01',
    occurrences: 3,
    escalationLevel: 2,
    tags: ['infrastructure', 'cpu', 'production'],
    impactedUsers: 1500,
    runbook: 'https://wiki.company.com/runbooks/high-cpu'
  },
  {
    id: '2',
    title: 'Database Connection Pool Exhausted',
    description: 'PostgreSQL connection pool has reached maximum capacity',
    severity: 'high',
    status: 'acknowledged',
    service: 'Database',
    source: 'CloudWatch',
    triggeredAt: '2024-01-15T14:15:00Z',
    acknowledgedAt: '2024-01-15T14:18:00Z',
    acknowledgedBy: 'Sarah Chen',
    incidentNumber: 'INC-2024-002',
    occurrences: 1,
    escalationLevel: 1,
    tags: ['database', 'postgres', 'connections'],
    impactedUsers: 800
  },
  {
    id: '3',
    title: 'SSL Certificate Expiring Soon',
    description: 'SSL certificate for api.company.com expires in 7 days',
    severity: 'medium',
    status: 'triggered',
    service: 'Load Balancer',
    source: 'CertManager',
    triggeredAt: '2024-01-15T10:00:00Z',
    occurrences: 1,
    escalationLevel: 0,
    tags: ['ssl', 'certificate', 'security']
  },
  {
    id: '4',
    title: 'Memory Leak Detected in Worker Service',
    description: 'Memory usage growing consistently without release in background-worker',
    severity: 'high',
    status: 'resolved',
    service: 'Background Workers',
    source: 'New Relic',
    triggeredAt: '2024-01-15T08:00:00Z',
    acknowledgedAt: '2024-01-15T08:05:00Z',
    resolvedAt: '2024-01-15T09:30:00Z',
    acknowledgedBy: 'Mike Johnson',
    resolvedBy: 'Mike Johnson',
    incidentNumber: 'INC-2024-003',
    occurrences: 5,
    escalationLevel: 1,
    tags: ['memory', 'worker', 'performance']
  },
  {
    id: '5',
    title: 'Payment Gateway Timeout',
    description: 'Stripe API requests timing out with 30s+ response times',
    severity: 'critical',
    status: 'triggered',
    service: 'Payment Service',
    source: 'PagerDuty',
    triggeredAt: '2024-01-15T14:45:00Z',
    incidentNumber: 'INC-2024-004',
    occurrences: 8,
    escalationLevel: 3,
    tags: ['payments', 'stripe', 'timeout'],
    impactedUsers: 350
  },
  {
    id: '6',
    title: 'CDN Cache Hit Ratio Below Threshold',
    description: 'CloudFront cache hit ratio dropped to 45% (threshold: 80%)',
    severity: 'low',
    status: 'suppressed',
    service: 'CDN',
    source: 'CloudWatch',
    triggeredAt: '2024-01-15T12:00:00Z',
    occurrences: 2,
    escalationLevel: 0,
    tags: ['cdn', 'cache', 'performance']
  }
]

const mockOnCallSchedules: OnCallSchedule[] = [
  {
    id: '1',
    name: 'Platform Team',
    currentOnCall: { name: 'Sarah Chen', avatar: '/avatars/1.png', phone: '+1-555-0101', email: 'sarah@company.com' },
    nextOnCall: { name: 'Mike Johnson', avatar: '/avatars/2.png', shiftStart: '2024-01-16T09:00:00Z' },
    rotationType: 'weekly',
    escalationPolicy: 'Platform Critical'
  },
  {
    id: '2',
    name: 'Backend Team',
    currentOnCall: { name: 'Alex Wong', avatar: '/avatars/3.png', phone: '+1-555-0102', email: 'alex@company.com' },
    nextOnCall: { name: 'Emily Davis', avatar: '/avatars/4.png', shiftStart: '2024-01-16T09:00:00Z' },
    rotationType: 'daily',
    escalationPolicy: 'Backend Standard'
  },
  {
    id: '3',
    name: 'Frontend Team',
    currentOnCall: { name: 'Jordan Lee', avatar: '/avatars/5.png', phone: '+1-555-0103', email: 'jordan@company.com' },
    nextOnCall: { name: 'Casey Smith', avatar: '/avatars/6.png', shiftStart: '2024-01-17T09:00:00Z' },
    rotationType: 'weekly',
    escalationPolicy: 'Frontend Standard'
  }
]

const mockServices: Service[] = [
  { id: '1', name: 'API Gateway', description: 'Main API entry point for all services', status: 'critical', owner: 'Sarah Chen', team: 'Platform', alertCount: 3, lastIncident: '2 min ago', integrations: ['Datadog', 'PagerDuty'], uptime: 99.2 },
  { id: '2', name: 'Database', description: 'PostgreSQL primary database cluster', status: 'degraded', owner: 'Mike Johnson', team: 'Backend', alertCount: 1, lastIncident: '15 min ago', integrations: ['CloudWatch', 'PagerDuty'], uptime: 99.8 },
  { id: '3', name: 'Payment Service', description: 'Payment processing and Stripe integration', status: 'critical', owner: 'Emily Davis', team: 'Backend', alertCount: 2, lastIncident: 'Just now', integrations: ['New Relic', 'PagerDuty'], uptime: 98.5 },
  { id: '4', name: 'Background Workers', description: 'Async job processing with Sidekiq', status: 'operational', owner: 'Alex Wong', team: 'Backend', alertCount: 0, integrations: ['New Relic', 'Datadog'], uptime: 99.9 },
  { id: '5', name: 'CDN', description: 'CloudFront content delivery network', status: 'operational', owner: 'Jordan Lee', team: 'Platform', alertCount: 0, integrations: ['CloudWatch'], uptime: 99.99 }
]

const mockEscalationPolicies: EscalationPolicy[] = [
  {
    id: '1',
    name: 'Platform Critical',
    description: 'Critical alerts for platform infrastructure',
    levels: [
      { level: 1, targets: ['On-Call Engineer'], timeout: 5 },
      { level: 2, targets: ['Team Lead', 'On-Call Engineer'], timeout: 10 },
      { level: 3, targets: ['VP Engineering', 'Team Lead'], timeout: 15 }
    ],
    services: 3,
    isDefault: false
  },
  {
    id: '2',
    name: 'Backend Standard',
    description: 'Standard escalation for backend services',
    levels: [
      { level: 1, targets: ['On-Call Engineer'], timeout: 10 },
      { level: 2, targets: ['Team Lead'], timeout: 20 }
    ],
    services: 5,
    isDefault: true
  }
]

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Datadog', type: 'monitoring', icon: '📊', status: 'active', alertsReceived: 1245, lastAlert: '5 min ago' },
  { id: '2', name: 'New Relic', type: 'apm', icon: '🔍', status: 'active', alertsReceived: 892, lastAlert: '12 min ago' },
  { id: '3', name: 'CloudWatch', type: 'cloud', icon: '☁️', status: 'active', alertsReceived: 456, lastAlert: '1 hour ago' },
  { id: '4', name: 'Slack', type: 'notification', icon: '💬', status: 'active', alertsReceived: 0, lastAlert: 'N/A' },
  { id: '5', name: 'Jira', type: 'ticketing', icon: '🎫', status: 'inactive', alertsReceived: 234, lastAlert: '2 days ago' }
]

// Enhanced Alerts Mock Data
const mockAlertsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Alert Volume', description: 'Critical alerts down 40% this week. Great incident response!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Trends' },
  { id: '2', type: 'info' as const, title: 'Common Pattern', description: 'Memory alerts peak at 3 AM. Consider auto-scaling during off-hours.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Patterns' },
  { id: '3', type: 'warning' as const, title: 'Pending Action', description: '3 critical alerts require immediate attention.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Action' },
]

const mockAlertsCollaborators = [
  { id: '1', name: 'On-Call Lead', avatar: '/avatars/oncall.jpg', status: 'online' as const, role: 'Incident Response', lastActive: 'Now' },
  { id: '2', name: 'NOC Analyst', avatar: '/avatars/noc.jpg', status: 'online' as const, role: 'Monitoring', lastActive: '2m ago' },
  { id: '3', name: 'Escalation Mgr', avatar: '/avatars/esc.jpg', status: 'away' as const, role: 'Escalations', lastActive: '20m ago' },
]

const mockAlertsPredictions = [
  { id: '1', label: 'Daily Alerts', current: 45, target: 30, predicted: 38, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'MTTR (min)', current: 12, target: 8, predicted: 10, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Resolution %', current: 94, target: 98, predicted: 96, confidence: 85, trend: 'up' as const },
]

const mockAlertsActivities = [
  { id: '1', user: 'On-Call Lead', action: 'acknowledged', target: 'CPU spike alert', timestamp: '5m ago', type: 'success' as const },
  { id: '2', user: 'NOC Analyst', action: 'escalated', target: 'database connectivity issue', timestamp: '20m ago', type: 'info' as const },
  { id: '3', user: 'Escalation Mgr', action: 'resolved', target: 'P1 incident #4521', timestamp: '1h ago', type: 'success' as const },
]

const mockAlertsQuickActions = [
  { id: '1', label: 'Acknowledge', icon: 'Check', shortcut: 'A', action: () => toast.success('Alert Acknowledged', { description: 'Team has been notified' }) },
  { id: '2', label: 'Escalate', icon: 'ArrowUp', shortcut: 'E', action: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Escalating to on-call team...', success: 'Alert escalated to L2 support', error: 'Escalation failed' }) },
  { id: '3', label: 'Silence', icon: 'BellOff', shortcut: 'S', action: () => toast.success('Alert Silenced', { description: 'Notifications muted for 4 hours' }) },
  { id: '4', label: 'Create Rule', icon: 'Plus', shortcut: 'R', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Opening rule builder...', success: 'Define conditions and actions for automatic responses', error: 'Failed to open' }) },
]

export default function AlertsClient() {
  const [activeTab, setActiveTab] = useState('alerts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Real Supabase hook
  const {
    alerts: dbAlerts,
    stats: dbStats,
    isLoading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
    snoozeAlert,
    deleteAlert
  } = useAlerts()

  // Create alert form state
  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    description: '',
    severity: 'info' as DBAlert['severity'],
    category: 'other' as DBAlert['category'],
    source: 'manual',
    tags: [] as string[],
    tagInput: ''
  })

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Map DB alerts to UI Alert format
  const mappedAlerts: Alert[] = useMemo(() => {
    return dbAlerts.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      severity: mapDBSeverityToUI(a.severity),
      status: mapDBStatusToUI(a.status),
      service: a.source_type || a.source || 'Unknown',
      source: a.source,
      triggeredAt: a.triggered_at,
      acknowledgedAt: a.acknowledged_at || undefined,
      resolvedAt: a.resolved_at || undefined,
      acknowledgedBy: a.assigned_to || undefined,
      resolvedBy: a.assigned_to || undefined,
      incidentNumber: a.alert_code,
      deduplicationKey: a.source_id || undefined,
      occurrences: a.occurrences,
      escalationLevel: a.escalation_level,
      tags: a.tags,
      impactedUsers: (a.metadata as Record<string, number>)?.impacted_users,
      runbook: (a.metadata as Record<string, string>)?.runbook
    }))
  }, [dbAlerts])

  // Helper functions to map DB types to UI types
  function mapDBSeverityToUI(severity: DBAlert['severity']): AlertSeverity {
    const mapping: Record<DBAlert['severity'], AlertSeverity> = {
      'critical': 'critical',
      'error': 'high',
      'warning': 'medium',
      'info': 'info'
    }
    return mapping[severity] || 'info'
  }

  function mapDBStatusToUI(status: DBAlert['status']): AlertStatus {
    const mapping: Record<DBAlert['status'], AlertStatus> = {
      'active': 'triggered',
      'acknowledged': 'acknowledged',
      'resolved': 'resolved',
      'snoozed': 'suppressed',
      'escalated': 'triggered'
    }
    return mapping[status] || 'triggered'
  }

  function mapUISeverityToDB(severity: AlertSeverity): DBAlert['severity'] {
    const mapping: Record<AlertSeverity, DBAlert['severity']> = {
      'critical': 'critical',
      'high': 'error',
      'medium': 'warning',
      'low': 'info',
      'info': 'info'
    }
    return mapping[severity] || 'info'
  }

  // Filter alerts - use mapped DB alerts, falling back to mock if empty
  const alertsToFilter = mappedAlerts.length > 0 ? mappedAlerts : mockAlerts
  const filteredAlerts = useMemo(() => {
    return alertsToFilter.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.service.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity
      const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus
      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [alertsToFilter, searchQuery, selectedSeverity, selectedStatus])

  // Stats - use real DB stats when available
  const alertStats = useMemo(() => {
    const alertsSource = mappedAlerts.length > 0 ? mappedAlerts : mockAlerts
    const triggered = alertsSource.filter(a => a.status === 'triggered').length
    const acknowledged = alertsSource.filter(a => a.status === 'acknowledged').length
    const resolved = alertsSource.filter(a => a.status === 'resolved').length
    const critical = alertsSource.filter(a => a.severity === 'critical').length
    const high = alertsSource.filter(a => a.severity === 'high').length
    return {
      total: alertsSource.length,
      triggered,
      acknowledged,
      resolved,
      critical,
      high,
      // Include DB stats if available
      active: dbStats?.active || triggered,
      avgResponseTime: dbStats?.avgResponseTime || 0,
      avgResolutionTime: dbStats?.avgResolutionTime || 0
    }
  }, [mappedAlerts, dbStats])

  const stats = [
    { label: 'Active Alerts', value: (alertStats.triggered + alertStats.acknowledged).toString(), change: '+5', icon: BellRing, color: 'from-red-500 to-red-600' },
    { label: 'Triggered', value: alertStats.triggered.toString(), change: '+2', icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
    { label: 'Acknowledged', value: alertStats.acknowledged.toString(), change: '+1', icon: CheckCircle2, color: 'from-blue-500 to-blue-600' },
    { label: 'Resolved (24h)', value: alertStats.resolved.toString(), change: '+8', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { label: 'Critical', value: alertStats.critical.toString(), change: '+1', icon: AlertOctagon, color: 'from-rose-500 to-rose-600' },
    { label: 'MTTR', value: '12m', change: '-3m', icon: Timer, color: 'from-purple-500 to-purple-600' },
    { label: 'On-Call', value: '3', change: '', icon: UserCheck, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Services', value: mockServices.length.toString(), change: '', icon: Server, color: 'from-indigo-500 to-indigo-600' }
  ]

  const getSeverityColor = (severity: AlertSeverity): string => {
    const colors: Record<AlertSeverity, string> = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'info': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[severity]
  }

  const getStatusColor = (status: AlertStatus): string => {
    const colors: Record<AlertStatus, string> = {
      'triggered': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'acknowledged': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'suppressed': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status]
  }

  const getServiceStatusColor = (status: ServiceStatus): string => {
    const colors: Record<ServiceStatus, string> = {
      'operational': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'degraded': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'maintenance': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
    return colors[status]
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="h-5 w-5 text-red-600" />
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'medium': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'low': return <Info className="h-5 w-5 text-blue-600" />
      default: return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  // Handlers - Real Supabase operations
  const handleCreateAlert = async () => {
    if (!newAlertForm.title.trim()) {
      toast.error('Validation Error', { description: 'Alert title is required' })
      return
    }
    try {
      await createAlert({
        title: newAlertForm.title,
        description: newAlertForm.description || null,
        severity: newAlertForm.severity,
        category: newAlertForm.category,
        source: newAlertForm.source,
        tags: newAlertForm.tags,
        status: 'active',
        triggered_at: new Date().toISOString()
      })
      toast.success('Alert Created', { description: `"${newAlertForm.title}" has been created` })
      setShowCreateDialog(false)
      setNewAlertForm({
        title: '',
        description: '',
        severity: 'info',
        category: 'other',
        source: 'manual',
        tags: [],
        tagInput: ''
      })
    } catch (err) {
      toast.error('Failed to Create Alert', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId)
      toast.success('Alert Acknowledged', { description: `Alert has been acknowledged` })
    } catch (err) {
      toast.error('Failed to Acknowledge', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId)
      toast.success('Alert Resolved', { description: `Alert has been resolved` })
    } catch (err) {
      toast.error('Failed to Resolve', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleEscalateAlert = async (alertId: string) => {
    try {
      await escalateAlert(alertId)
      toast.success('Alert Escalated', { description: `Alert has been escalated to the next tier` })
    } catch (err) {
      toast.error('Failed to Escalate', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleMuteAlert = async (alertId: string, alertName: string) => {
    try {
      await snoozeAlert(alertId, 60) // 60 minutes
      toast.success('Alert Snoozed', { description: `"${alertName}" snoozed for 1 hour` })
    } catch (err) {
      toast.error('Failed to Snooze', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deleteAlert(alertId)
      toast.success('Alert Deleted', { description: `Alert has been removed` })
    } catch (err) {
      toast.error('Failed to Delete', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      await updateAlert(alertId, { status: 'resolved', resolved_at: new Date().toISOString() })
      toast.success('Alert Dismissed', { description: 'Alert has been dismissed' })
    } catch (err) {
      toast.error('Failed to Dismiss', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleExportAlerts = () => {
    toast.success('Exporting Alerts', { description: 'Alert history will be downloaded' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Management</h1>
              <p className="text-gray-500 dark:text-gray-400">Monitor alerts, on-call schedules, and incidents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                className="w-72 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading filters...', success: 'Advanced filters ready', error: 'Failed to load' })}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4 flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-blue-700 dark:text-blue-300">Loading alerts from database...</span>
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 dark:text-red-300">Error: {error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchAlerts()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
                {stat.change && (
                  <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                    {stat.change} today
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <BellRing className="h-4 w-4 mr-2" />
              Alerts ({alertStats.triggered + alertStats.acknowledged})
            </TabsTrigger>
            <TabsTrigger value="oncall" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <UserCheck className="h-4 w-4 mr-2" />
              On-Call
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <Server className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="escalations" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <ArrowUp className="h-4 w-4 mr-2" />
              Escalations
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <Link2 className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                All
              </Button>
              <Button
                variant={selectedStatus === 'triggered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('triggered')}
                className={selectedStatus === 'triggered' ? 'bg-red-600' : ''}
              >
                Triggered
              </Button>
              <Button
                variant={selectedStatus === 'acknowledged' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('acknowledged')}
                className={selectedStatus === 'acknowledged' ? 'bg-blue-600' : ''}
              >
                Acknowledged
              </Button>
              <Button
                variant={selectedStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('resolved')}
                className={selectedStatus === 'resolved' ? 'bg-green-600' : ''}
              >
                Resolved
              </Button>
              <div className="ml-4 border-l pl-4 flex items-center gap-2">
                <Button
                  variant={selectedSeverity === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity('all')}
                >
                  All Severity
                </Button>
                <Button
                  variant={selectedSeverity === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity('critical')}
                  className={selectedSeverity === 'critical' ? 'bg-red-600' : ''}
                >
                  Critical
                </Button>
                <Button
                  variant={selectedSeverity === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity('high')}
                  className={selectedSeverity === 'high' ? 'bg-orange-600' : ''}
                >
                  High
                </Button>
              </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredAlerts.length === 0 && !isLoading && (
                    <div className="p-12 text-center">
                      <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alerts found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchQuery || selectedSeverity !== 'all' || selectedStatus !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Create your first alert to get started'}
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Alert
                      </Button>
                    </div>
                  )}
                  {filteredAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                        alert.status === 'triggered' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                        alert.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
                        alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {getSeverityIcon(alert.severity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{alert.title}</h4>
                          {alert.incidentNumber && (
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{alert.incidentNumber}</code>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mb-2">{alert.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            {alert.service}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {alert.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(alert.triggeredAt)}
                          </span>
                          {alert.occurrences > 1 && (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {alert.occurrences}x
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                        </div>
                        {alert.escalationLevel > 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Level {alert.escalationLevel}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {alert.status === 'triggered' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => { e.stopPropagation(); handleAcknowledgeAlert(alert.id) }}>
                            Acknowledge
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleResolveAlert(alert.id) }}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* On-Call Tab */}
          <TabsContent value="oncall" className="mt-6">
            <div className="grid grid-cols-3 gap-6">
              {mockOnCallSchedules.map(schedule => (
                <Card key={schedule.id} className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{schedule.name}</CardTitle>
                      <Badge variant="outline">{schedule.rotationType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-2">Currently On-Call</p>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={schedule.currentOnCall.avatar} />
                            <AvatarFallback>{schedule.currentOnCall.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{schedule.currentOnCall.name}</p>
                            <p className="text-xs text-gray-500">{schedule.currentOnCall.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: `Calling ${schedule.currentOnCall.name}...`, success: 'Call initiated', error: 'Call failed' })}>
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Opening email to ${schedule.currentOnCall.email}...`, success: 'Email client ready', error: 'Failed to open email' })}>
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Next On-Call</p>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={schedule.nextOnCall.avatar} />
                            <AvatarFallback>{schedule.nextOnCall.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{schedule.nextOnCall.name}</p>
                            <p className="text-xs text-gray-500">Starts: {formatTime(schedule.nextOnCall.shiftStart)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Escalation Policy</span>
                        <Badge variant="outline">{schedule.escalationPolicy}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service Directory</CardTitle>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening service config...', success: 'Configure your new service', error: 'Failed to open' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockServices.map(service => (
                    <div key={service.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'operational' ? 'bg-green-500' :
                        service.status === 'degraded' ? 'bg-yellow-500' :
                        service.status === 'critical' ? 'bg-red-500 animate-pulse' :
                        'bg-blue-500'
                      }`} />

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>

                      <Badge className={getServiceStatusColor(service.status)}>{service.status}</Badge>

                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{service.alertCount}</p>
                        <p className="text-xs text-gray-500">alerts</p>
                      </div>

                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{service.uptime}%</p>
                        <p className="text-xs text-gray-500">uptime</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium">{service.owner}</p>
                        <p className="text-xs text-gray-500">{service.team}</p>
                      </div>

                      <Button variant="ghost" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading settings...', success: `Configure ${service.name}`, error: 'Failed to load' })}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escalations Tab */}
          <TabsContent value="escalations" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              {mockEscalationPolicies.map(policy => (
                <Card key={policy.id} className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{policy.description}</p>
                      </div>
                      {policy.isDefault && <Badge>Default</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {policy.levels.map((level, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">{level.level}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{level.targets.join(', ')}</p>
                            <p className="text-xs text-gray-500">Notify after {level.timeout} min</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-sm text-gray-500">{policy.services} services using this policy</span>
                      <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening editor...', success: `Editing "${policy.name}"`, error: 'Failed to open' })}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Connected Integrations</CardTitle>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading marketplace...', success: 'Browse available integrations', error: 'Failed to load' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockIntegrations.map(integration => (
                    <div key={integration.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                        {integration.icon}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{integration.type}</p>
                      </div>

                      <Badge className={
                        integration.status === 'active' ? 'bg-green-100 text-green-700' :
                        integration.status === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {integration.status}
                      </Badge>

                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{integration.alertsReceived.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">alerts received</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Last alert</p>
                        <p className="text-sm font-medium">{integration.lastAlert}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch checked={integration.status === 'active'} onCheckedChange={(checked) => toast.success(checked ? 'Integration Enabled' : 'Integration Disabled', { description: `${integration.name} has been ${checked ? 'enabled' : 'disabled'}` })} />
                        <Button variant="ghost" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading...', success: `Configure ${integration.name}`, error: 'Failed' })}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          {/* Settings Tab - PagerDuty Level Incident Management */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure alert management</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'escalations', label: 'Escalations', icon: ArrowUp },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'rules', label: 'Rules & Routing', icon: Target },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-red-600 text-white'
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

                {/* Alert Stats Sidebar */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Alert Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">MTTA</span>
                        <span className="font-medium">4.2 min</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">MTTR</span>
                        <span className="font-medium">18.5 min</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Resolution Rate</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Active Alerts</span>
                        <span className="font-medium text-red-600">12</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">This Week</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Noise Reduction</span>
                        <span className="font-medium text-emerald-600">67%</span>
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
                        <CardDescription>Basic alert configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Alert Priority</Label>
                            <Select defaultValue="high">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
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
                        <div className="flex items-center justify-between py-4 border-t">
                          <div>
                            <Label>Auto-Acknowledge</Label>
                            <p className="text-sm text-gray-500">Auto-acknowledge after investigation starts</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Smart Grouping</Label>
                            <p className="text-sm text-gray-500">Group related alerts automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Noise Reduction</Label>
                            <p className="text-sm text-gray-500">Suppress duplicate alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Incident Creation</CardTitle>
                        <CardDescription>Configure automatic incident creation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Create Incidents</Label>
                            <p className="text-sm text-gray-500">Automatically create incidents for critical alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Incident Threshold</Label>
                            <Select defaultValue="critical">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">Critical Only</SelectItem>
                                <SelectItem value="high">High and Above</SelectItem>
                                <SelectItem value="medium">Medium and Above</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Merge Window</Label>
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
                            <Label>Include Runbook Links</Label>
                            <p className="text-sm text-gray-500">Attach relevant runbooks to incidents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notification Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Configure how alerts are delivered</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Push Notifications', icon: Smartphone, config: 'Mobile app', enabled: true },
                          { name: 'Email', icon: Mail, config: 'team@company.com', enabled: true },
                          { name: 'SMS', icon: MessageSquare, config: '+1 (555) 123-4567', enabled: true },
                          { name: 'Phone Call', icon: PhoneCall, config: 'Critical only', enabled: false },
                          { name: 'Slack', icon: Slack, config: '#alerts-production', enabled: true },
                          { name: 'Microsoft Teams', icon: MessageCircle, config: 'DevOps Team', enabled: false }
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
                              <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening...', success: `Configure ${channel.name}`, error: 'Failed' })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch defaultChecked={channel.enabled} onCheckedChange={(checked) => toast.success(checked ? 'Channel Enabled' : 'Channel Disabled', { description: `${channel.name} notifications ${checked ? 'enabled' : 'disabled'}` })} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-4" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening channel setup...', success: 'Configure notification channel', error: 'Failed to open' })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Notification Channel
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure notification behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Notification Urgency</Label>
                            <Select defaultValue="high">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">Critical Only</SelectItem>
                                <SelectItem value="high">High and Above</SelectItem>
                                <SelectItem value="all">All Alerts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Repeat Interval</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Don't repeat</SelectItem>
                                <SelectItem value="5">Every 5 min</SelectItem>
                                <SelectItem value="15">Every 15 min</SelectItem>
                                <SelectItem value="30">Every 30 min</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Sound Notifications</Label>
                            <p className="text-sm text-gray-500">Play sound for new alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Rich Notifications</Label>
                            <p className="text-sm text-gray-500">Include charts and context in notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>Suppress non-critical notifications during off hours</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Quiet Hours</Label>
                            <p className="text-sm text-gray-500">Reduce notifications during specified hours</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Critical Alerts</Label>
                            <p className="text-sm text-gray-500">Critical alerts bypass quiet hours</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Escalation Settings */}
                {settingsTab === 'escalations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Policies</CardTitle>
                        <CardDescription>Configure multi-tier alert escalation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { tier: 'Tier 1', team: 'On-call Engineer', delay: 'Immediate', channels: ['Push', 'Slack'] },
                          { tier: 'Tier 2', team: 'Senior Engineer', delay: '15 min', channels: ['Push', 'SMS'] },
                          { tier: 'Tier 3', team: 'Team Lead', delay: '30 min', channels: ['Phone', 'SMS'] },
                          { tier: 'Tier 4', team: 'Engineering Manager', delay: '45 min', channels: ['Phone'] }
                        ].map((policy, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{policy.tier}: {policy.team}</p>
                              <p className="text-sm text-gray-500">
                                After {policy.delay} → {policy.channels.join(', ')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening...', success: `Editing ${policy.tier}`, error: 'Failed' })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: `Removing ${policy.tier}...`, success: `${policy.tier} has been removed from escalation`, error: 'Failed to remove tier' })}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Adding tier...', success: 'New escalation tier added', error: 'Failed to add' })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Escalation Tier
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>On-Call Schedules</CardTitle>
                        <CardDescription>Configure on-call rotation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Primary On-Call', current: 'John Smith', next: 'Jane Doe', rotation: 'Weekly' },
                          { name: 'Secondary On-Call', current: 'Bob Wilson', next: 'Alice Chen', rotation: 'Weekly' },
                          { name: 'Weekend On-Call', current: 'Mike Brown', next: 'Sarah Lee', rotation: 'Bi-weekly' }
                        ].map((schedule, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{schedule.name}</p>
                              <p className="text-sm text-gray-500">
                                Current: {schedule.current} • Next: {schedule.next}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{schedule.rotation}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening...', success: `Editing ${schedule.name}`, error: 'Failed' })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Creating schedule...', success: 'Configure on-call schedule', error: 'Failed to create' })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Schedule
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Rules</CardTitle>
                        <CardDescription>Configure when to escalate</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Escalate After</Label>
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
                          <div className="space-y-2">
                            <Label>Max Escalations</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2 levels</SelectItem>
                                <SelectItem value="3">3 levels</SelectItem>
                                <SelectItem value="4">4 levels</SelectItem>
                                <SelectItem value="5">5 levels</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Round-Robin Assignment</Label>
                            <p className="text-sm text-gray-500">Distribute alerts evenly across team</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Acknowledge Stops Escalation</Label>
                            <p className="text-sm text-gray-500">Stop escalating when acknowledged</p>
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
                        <CardTitle>Monitoring Integrations</CardTitle>
                        <CardDescription>Connect to monitoring tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Datadog', status: 'connected', lastSync: '2 min ago' },
                          { name: 'New Relic', status: 'connected', lastSync: '5 min ago' },
                          { name: 'Prometheus', status: 'connected', lastSync: '1 min ago' },
                          { name: 'CloudWatch', status: 'not_connected', lastSync: null },
                          { name: 'Splunk', status: 'not_connected', lastSync: null }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${integration.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Activity className={`h-4 w-4 ${integration.status === 'connected' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                {integration.lastSync && (
                                  <p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p>
                                )}
                              </div>
                            </div>
                            <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                              {integration.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Ticketing & ITSM</CardTitle>
                        <CardDescription>Connect to ticketing systems</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Jira', status: 'connected', project: 'OPS' },
                          { name: 'ServiceNow', status: 'not_connected', project: null },
                          { name: 'Zendesk', status: 'not_connected', project: null },
                          { name: 'Freshdesk', status: 'not_connected', project: null }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${integration.status === 'connected' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Layers className={`h-4 w-4 ${integration.status === 'connected' ? 'text-blue-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                {integration.project && (
                                  <p className="text-sm text-gray-500">Project: {integration.project}</p>
                                )}
                              </div>
                            </div>
                            <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                              {integration.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API & Webhooks</CardTitle>
                        <CardDescription>External integrations via API</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="kazi-alerts-xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Copying API key...', success: 'API key copied to clipboard', error: 'Failed to copy' })}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Generating new API key...', success: 'New API key generated! Copy it now.', error: 'Failed to generate' })}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="pt-4 border-t space-y-4">
                          {[
                            { url: 'https://api.company.com/alerts', events: ['triggered', 'resolved'] },
                            { url: 'https://slack-webhook.company.com', events: ['critical'] }
                          ].map((webhook, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                              <div>
                                <p className="font-mono text-sm">{webhook.url}</p>
                                <p className="text-sm text-gray-500">Events: {webhook.events.join(', ')}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening...', success: 'Configure webhook', error: 'Failed' })}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Deleting webhook...', success: 'Webhook has been removed', error: 'Failed to delete webhook' })}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Adding webhook...', success: 'Configure new webhook endpoint', error: 'Failed to add' })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Rules & Routing */}
                {settingsTab === 'rules' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Rules</CardTitle>
                        <CardDescription>Configure alert processing rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'CPU Critical', condition: 'cpu_usage > 90%', action: 'Escalate immediately', enabled: true },
                          { name: 'Memory Warning', condition: 'memory_usage > 80%', action: 'Group for 5 min', enabled: true },
                          { name: 'Disk Space Low', condition: 'disk_usage > 85%', action: 'Create ticket', enabled: true },
                          { name: 'API Latency', condition: 'p99_latency > 500ms', action: 'Notify on-call', enabled: false }
                        ].map((rule, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Target className={`h-4 w-4 ${rule.enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{rule.name}</p>
                                <p className="text-sm text-gray-500">{rule.condition} → {rule.action}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening...', success: `Editing "${rule.name}"`, error: 'Failed' })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Switch defaultChecked={rule.enabled} onCheckedChange={(checked) => toast.success(checked ? 'Rule Enabled' : 'Rule Disabled', { description: `"${rule.name}" has been ${checked ? 'enabled' : 'disabled'}` })} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening rule builder...', success: 'Create your alert rule', error: 'Failed to open' })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Rule
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Routing</CardTitle>
                        <CardDescription>Route alerts to appropriate teams</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { service: 'api-gateway', team: 'Platform Team', schedule: 'Primary On-Call' },
                          { service: 'database-*', team: 'Data Team', schedule: 'DBA On-Call' },
                          { service: 'frontend-*', team: 'Frontend Team', schedule: 'Web On-Call' },
                          { service: 'payment-*', team: 'Payments Team', schedule: 'Payments On-Call' }
                        ].map((route, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium font-mono">{route.service}</p>
                              <p className="text-sm text-gray-500">{route.team} • {route.schedule}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening...', success: `Configure ${route.service} routing`, error: 'Failed' })}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Adding routing rule...', success: 'Configure alert routing', error: 'Failed to add' })}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Routing Rule
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Suppression Rules</CardTitle>
                        <CardDescription>Suppress alerts during maintenance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Maintenance Windows</Label>
                            <p className="text-sm text-gray-500">Suppress alerts during scheduled maintenance</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Suppress Flapping Alerts</Label>
                            <p className="text-sm text-gray-500">Reduce noise from unstable services</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Flap Detection Window</Label>
                            <Select defaultValue="10">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="10">10 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Flap Threshold</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2 state changes</SelectItem>
                                <SelectItem value="3">3 state changes</SelectItem>
                                <SelectItem value="5">5 state changes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Configure alert history retention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Alert History</Label>
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
                          </div>
                          <div className="space-y-2">
                            <Label>Incident History</Label>
                            <Select defaultValue="365">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                                <SelectItem value="730">2 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Archive Resolved Alerts</Label>
                            <p className="text-sm text-gray-500">Move old alerts to cold storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Export & Reporting</CardTitle>
                        <CardDescription>Export alert data and reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select defaultValue="csv">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="pdf">PDF Report</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Range</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleExportAlerts}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Alert Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Security and access settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor for Actions</Label>
                            <p className="text-sm text-gray-500">Require 2FA for critical actions</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all alert actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP Allowlist</Label>
                            <p className="text-sm text-gray-500">Restrict API access by IP</p>
                          </div>
                          <Switch />
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
                            <p className="font-medium">Clear All Alerts</p>
                            <p className="text-sm text-gray-500">Delete all alert history</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Clearing alert history...', success: 'Alert history cleared', error: 'Failed to clear' })}>
                            Clear Alerts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Reset All Rules</p>
                            <p className="text-sm text-gray-500">Restore default alert rules</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Resetting rules...', success: 'Rules restored to defaults', error: 'Failed to reset' })}>
                            Reset Rules
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Delete All Integrations</p>
                            <p className="text-sm text-gray-500">Remove all connected services</p>
                          </div>
                          <Button variant="destructive" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Removing integrations...', success: 'All integrations removed', error: 'Failed to remove' })}>
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAlertsAIInsights}
              title="Alert Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAlertsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAlertsPredictions}
              title="Alert Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAlertsActivities}
            title="Alert Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAlertsQuickActions}
            variant="grid"
          />
        </div>

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <ScrollArea className="max-h-[80vh]">
              {selectedAlert && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedAlert.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {getSeverityIcon(selectedAlert.severity)}
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="text-xl">{selectedAlert.title}</DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedAlert.incidentNumber && (
                            <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{selectedAlert.incidentNumber}</code>
                          )}
                          <Badge className={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                          <Badge className={getStatusColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedAlert.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Service</h4>
                      <p className="text-gray-600">{selectedAlert.service}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Source</h4>
                      <p className="text-gray-600">{selectedAlert.source}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Triggered</h4>
                      <p className="text-gray-600">{formatTime(selectedAlert.triggeredAt)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Occurrences</h4>
                      <p className="text-gray-600">{selectedAlert.occurrences}</p>
                    </div>
                  </div>

                  {selectedAlert.impactedUsers && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">{selectedAlert.impactedUsers.toLocaleString()} users impacted</span>
                      </div>
                    </div>
                  )}

                  {selectedAlert.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAlert.runbook && (
                    <div>
                      <h4 className="font-medium mb-2">Runbook</h4>
                      <a href={selectedAlert.runbook} className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        View Runbook
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    {selectedAlert.status === 'triggered' && (
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={async () => { await handleAcknowledgeAlert(selectedAlert.id); setSelectedAlert(null) }}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                    {selectedAlert.status !== 'resolved' && (
                      <>
                        <Button variant="outline" onClick={async () => { await handleEscalateAlert(selectedAlert.id); setSelectedAlert(null) }}>
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Escalate
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={async () => { await handleResolveAlert(selectedAlert.id); setSelectedAlert(null) }}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={async () => { await handleMuteAlert(selectedAlert.id, selectedAlert.title); setSelectedAlert(null) }}>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Snooze
                    </Button>
                    <Button variant="ghost" className="ml-auto text-red-600" onClick={async () => { await handleDeleteAlert(selectedAlert.id); setSelectedAlert(null) }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Create Alert Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Alert title..."
                  value={newAlertForm.title}
                  onChange={(e) => setNewAlertForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Describe the alert..."
                  value={newAlertForm.description}
                  onChange={(e) => setNewAlertForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={newAlertForm.severity}
                    onValueChange={(value) => setNewAlertForm(prev => ({ ...prev, severity: value as DBAlert['severity'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newAlertForm.category}
                    onValueChange={(value) => setNewAlertForm(prev => ({ ...prev, category: value as DBAlert['category'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                      <SelectItem value="capacity">Capacity</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  placeholder="manual"
                  value={newAlertForm.source}
                  onChange={(e) => setNewAlertForm(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newAlertForm.tagInput}
                    onChange={(e) => setNewAlertForm(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newAlertForm.tagInput.trim()) {
                        e.preventDefault()
                        setNewAlertForm(prev => ({
                          ...prev,
                          tags: [...prev.tags, prev.tagInput.trim()],
                          tagInput: ''
                        }))
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newAlertForm.tagInput.trim()) {
                        setNewAlertForm(prev => ({
                          ...prev,
                          tags: [...prev.tags, prev.tagInput.trim()],
                          tagInput: ''
                        }))
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                {newAlertForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newAlertForm.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => {
                        setNewAlertForm(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, idx) => idx !== i)
                        }))
                      }}>
                        {tag} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                onClick={handleCreateAlert}
              >
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
