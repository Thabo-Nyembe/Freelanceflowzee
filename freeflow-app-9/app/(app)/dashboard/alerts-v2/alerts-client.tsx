'use client'

import { useState, useMemo } from 'react'
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
  BellOff,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  User,
  UserCheck,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Server,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowDown,
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
  Siren,
  Radio,
  PhoneCall,
  MessageCircle,
  Slack,
  Send
} from 'lucide-react'

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

export default function AlertsClient() {
  const [activeTab, setActiveTab] = useState('alerts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.service.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity
      const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus
      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [searchQuery, selectedSeverity, selectedStatus])

  // Stats
  const alertStats = useMemo(() => {
    const triggered = mockAlerts.filter(a => a.status === 'triggered').length
    const acknowledged = mockAlerts.filter(a => a.status === 'acknowledged').length
    const resolved = mockAlerts.filter(a => a.status === 'resolved').length
    const critical = mockAlerts.filter(a => a.severity === 'critical').length
    const high = mockAlerts.filter(a => a.severity === 'high').length
    return { total: mockAlerts.length, triggered, acknowledged, resolved, critical, high }
  }, [])

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
            <Button variant="outline">
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
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Acknowledge
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button size="sm" variant="outline">
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
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline">
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
                  <Button className="bg-red-600 hover:bg-red-700">
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

                      <Button variant="ghost" size="icon">
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
                      <Button variant="outline" size="sm">
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
                  <Button className="bg-red-600 hover:bg-red-700">
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
                        <Switch checked={integration.status === 'active'} />
                        <Button variant="ghost" size="icon">
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
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive mobile push notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-gray-500">Send critical alerts via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive SMS for critical incidents</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Slack Integration</p>
                      <p className="text-sm text-gray-500">Post alerts to Slack channels</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Alert Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Acknowledge</p>
                      <p className="text-sm text-gray-500">Auto-acknowledge after investigation</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Smart Grouping</p>
                      <p className="text-sm text-gray-500">Group related alerts automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Noise Reduction</p>
                      <p className="text-sm text-gray-500">Suppress duplicate alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Incident Creation</p>
                      <p className="text-sm text-gray-500">Auto-create incidents for critical alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                    {selectedAlert.status !== 'resolved' && (
                      <>
                        <Button variant="outline">
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Escalate
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </>
                    )}
                    <Button variant="outline">
                      <VolumeX className="h-4 w-4 mr-2" />
                      Snooze
                    </Button>
                    <Button variant="ghost" className="ml-auto text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
