'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  User,
  Users,
  Key,
  Database,
  Server,
  Code,
  Terminal,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  BellRing,
  Settings,
  Play,
  Pause,
  Zap,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Copy,
  ExternalLink,
  Bookmark,
  Share2,
  Trash2,
  Archive,
  Tag,
  Layers,
  Layout,
  Grid3X3,
  List
} from 'lucide-react'

// Types
type LogStatus = 'success' | 'failed' | 'blocked' | 'warning' | 'info'
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'
type AccessType = 'login' | 'logout' | 'api' | 'admin' | 'file' | 'database' | 'system'
type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'

interface AccessLog {
  id: string
  timestamp: string
  status: LogStatus
  level: LogLevel
  accessType: AccessType
  user: {
    id: string
    name: string
    email: string
    avatar: string
  } | null
  resource: string
  method: string
  statusCode: number
  ipAddress: string
  location: {
    city: string
    country: string
    coordinates: string
  }
  device: {
    type: DeviceType
    browser: string
    os: string
    version: string
  }
  duration: number
  requestSize: number
  responseSize: number
  userAgent: string
  referrer: string | null
  sessionId: string
  requestId: string
  errorMessage: string | null
  stackTrace: string | null
  tags: string[]
  isSuspicious: boolean
  isBot: boolean
}

interface LogPattern {
  id: string
  pattern: string
  occurrences: number
  status: LogStatus
  firstSeen: string
  lastSeen: string
  affectedResources: string[]
}

interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  timeWindow: string
  status: 'active' | 'paused' | 'triggered'
  lastTriggered: string | null
  notifyChannels: string[]
}

interface SavedView {
  id: string
  name: string
  filters: {
    status?: LogStatus[]
    level?: LogLevel[]
    accessType?: AccessType[]
    dateRange?: string
  }
  isDefault: boolean
  createdAt: string
}

interface LogStats {
  total: number
  success: number
  failed: number
  blocked: number
  suspicious: number
  avgDuration: number
  successRate: number
  errorRate: number
  requestsPerMinute: number
  uniqueUsers: number
  uniqueIPs: number
  bytesTransferred: number
}

// Mock data
const mockLogs: AccessLog[] = [
  {
    id: '1',
    timestamp: '2024-12-24T10:30:45.123Z',
    status: 'success',
    level: 'info',
    accessType: 'login',
    user: { id: '1', name: 'Alex Chen', email: 'alex@company.com', avatar: '' },
    resource: '/api/auth/login',
    method: 'POST',
    statusCode: 200,
    ipAddress: '192.168.1.100',
    location: { city: 'San Francisco', country: 'USA', coordinates: '37.7749,-122.4194' },
    device: { type: 'desktop', browser: 'Chrome', os: 'macOS', version: '120.0' },
    duration: 145,
    requestSize: 256,
    responseSize: 1024,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referrer: 'https://app.company.com/login',
    sessionId: 'sess_abc123',
    requestId: 'req_xyz789',
    errorMessage: null,
    stackTrace: null,
    tags: ['auth', 'user-login'],
    isSuspicious: false,
    isBot: false
  },
  {
    id: '2',
    timestamp: '2024-12-24T10:28:30.456Z',
    status: 'failed',
    level: 'warn',
    accessType: 'login',
    user: null,
    resource: '/api/auth/login',
    method: 'POST',
    statusCode: 401,
    ipAddress: '203.45.67.89',
    location: { city: 'Unknown', country: 'Russia', coordinates: '55.7558,37.6173' },
    device: { type: 'desktop', browser: 'Firefox', os: 'Windows', version: '119.0' },
    duration: 89,
    requestSize: 128,
    responseSize: 64,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    referrer: null,
    sessionId: 'sess_def456',
    requestId: 'req_uvw123',
    errorMessage: 'Invalid credentials',
    stackTrace: null,
    tags: ['auth', 'failed-login'],
    isSuspicious: true,
    isBot: false
  },
  {
    id: '3',
    timestamp: '2024-12-24T10:25:15.789Z',
    status: 'success',
    level: 'info',
    accessType: 'api',
    user: { id: '2', name: 'Sarah Miller', email: 'sarah@company.com', avatar: '' },
    resource: '/api/v2/users/profile',
    method: 'GET',
    statusCode: 200,
    ipAddress: '10.0.0.55',
    location: { city: 'New York', country: 'USA', coordinates: '40.7128,-74.0060' },
    device: { type: 'mobile', browser: 'Safari', os: 'iOS', version: '17.0' },
    duration: 234,
    requestSize: 64,
    responseSize: 2048,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    referrer: 'https://app.company.com/dashboard',
    sessionId: 'sess_ghi789',
    requestId: 'req_rst456',
    errorMessage: null,
    stackTrace: null,
    tags: ['api', 'user-data'],
    isSuspicious: false,
    isBot: false
  },
  {
    id: '4',
    timestamp: '2024-12-24T10:22:00.012Z',
    status: 'blocked',
    level: 'error',
    accessType: 'api',
    user: null,
    resource: '/api/admin/users',
    method: 'DELETE',
    statusCode: 403,
    ipAddress: '45.67.89.123',
    location: { city: 'Beijing', country: 'China', coordinates: '39.9042,116.4074' },
    device: { type: 'bot', browser: 'Unknown', os: 'Linux', version: '' },
    duration: 12,
    requestSize: 32,
    responseSize: 48,
    userAgent: 'Python-urllib/3.9',
    referrer: null,
    sessionId: '',
    requestId: 'req_opq789',
    errorMessage: 'Blocked by WAF: Suspicious activity',
    stackTrace: null,
    tags: ['security', 'blocked', 'bot'],
    isSuspicious: true,
    isBot: true
  },
  {
    id: '5',
    timestamp: '2024-12-24T10:18:45.345Z',
    status: 'success',
    level: 'info',
    accessType: 'admin',
    user: { id: '3', name: 'Mike Johnson', email: 'mike@company.com', avatar: '' },
    resource: '/api/admin/settings',
    method: 'PUT',
    statusCode: 200,
    ipAddress: '192.168.1.50',
    location: { city: 'Austin', country: 'USA', coordinates: '30.2672,-97.7431' },
    device: { type: 'desktop', browser: 'Chrome', os: 'Windows', version: '120.0' },
    duration: 567,
    requestSize: 4096,
    responseSize: 512,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    referrer: 'https://app.company.com/admin/settings',
    sessionId: 'sess_jkl012',
    requestId: 'req_mno345',
    errorMessage: null,
    stackTrace: null,
    tags: ['admin', 'settings-update'],
    isSuspicious: false,
    isBot: false
  },
  {
    id: '6',
    timestamp: '2024-12-24T10:15:30.678Z',
    status: 'warning',
    level: 'warn',
    accessType: 'database',
    user: { id: '4', name: 'Emma Wilson', email: 'emma@company.com', avatar: '' },
    resource: '/api/db/query',
    method: 'POST',
    statusCode: 200,
    ipAddress: '10.0.0.88',
    location: { city: 'Seattle', country: 'USA', coordinates: '47.6062,-122.3321' },
    device: { type: 'desktop', browser: 'Chrome', os: 'macOS', version: '120.0' },
    duration: 2345,
    requestSize: 512,
    responseSize: 65536,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referrer: 'https://app.company.com/analytics',
    sessionId: 'sess_pqr678',
    requestId: 'req_stu901',
    errorMessage: 'Query took longer than expected',
    stackTrace: null,
    tags: ['database', 'slow-query'],
    isSuspicious: false,
    isBot: false
  },
  {
    id: '7',
    timestamp: '2024-12-24T10:12:15.901Z',
    status: 'failed',
    level: 'error',
    accessType: 'api',
    user: { id: '1', name: 'Alex Chen', email: 'alex@company.com', avatar: '' },
    resource: '/api/v2/payments/process',
    method: 'POST',
    statusCode: 500,
    ipAddress: '192.168.1.100',
    location: { city: 'San Francisco', country: 'USA', coordinates: '37.7749,-122.4194' },
    device: { type: 'desktop', browser: 'Chrome', os: 'macOS', version: '120.0' },
    duration: 1234,
    requestSize: 1024,
    responseSize: 256,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referrer: 'https://app.company.com/checkout',
    sessionId: 'sess_abc123',
    requestId: 'req_vwx234',
    errorMessage: 'Payment gateway timeout',
    stackTrace: 'Error: Gateway timeout at PaymentService.process (/app/services/payment.ts:145:12)...',
    tags: ['api', 'payment', 'error'],
    isSuspicious: false,
    isBot: false
  },
  {
    id: '8',
    timestamp: '2024-12-24T10:08:45.234Z',
    status: 'success',
    level: 'info',
    accessType: 'file',
    user: { id: '2', name: 'Sarah Miller', email: 'sarah@company.com', avatar: '' },
    resource: '/api/files/download/report-2024.pdf',
    method: 'GET',
    statusCode: 200,
    ipAddress: '10.0.0.55',
    location: { city: 'New York', country: 'USA', coordinates: '40.7128,-74.0060' },
    device: { type: 'desktop', browser: 'Safari', os: 'macOS', version: '17.2' },
    duration: 789,
    requestSize: 64,
    responseSize: 2097152,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referrer: 'https://app.company.com/reports',
    sessionId: 'sess_ghi789',
    requestId: 'req_yza567',
    errorMessage: null,
    stackTrace: null,
    tags: ['file', 'download', 'report'],
    isSuspicious: false,
    isBot: false
  }
]

const mockPatterns: LogPattern[] = [
  { id: '1', pattern: 'Failed login attempts from same IP', occurrences: 23, status: 'failed', firstSeen: '2024-12-20', lastSeen: '2024-12-24', affectedResources: ['/api/auth/login'] },
  { id: '2', pattern: 'Slow database queries (>2s)', occurrences: 15, status: 'warning', firstSeen: '2024-12-22', lastSeen: '2024-12-24', affectedResources: ['/api/db/query', '/api/analytics/report'] },
  { id: '3', pattern: 'Bot traffic blocked', occurrences: 156, status: 'blocked', firstSeen: '2024-12-01', lastSeen: '2024-12-24', affectedResources: ['/api/admin/*', '/api/users/*'] },
  { id: '4', pattern: '500 errors in payment service', occurrences: 8, status: 'failed', firstSeen: '2024-12-23', lastSeen: '2024-12-24', affectedResources: ['/api/v2/payments/*'] }
]

const mockAlerts: AlertRule[] = [
  { id: '1', name: 'High Error Rate', condition: 'error_rate > 5%', threshold: 5, timeWindow: '5 minutes', status: 'active', lastTriggered: '2024-12-24T08:30:00Z', notifyChannels: ['slack', 'email'] },
  { id: '2', name: 'Suspicious Login Activity', condition: 'failed_logins > 10', threshold: 10, timeWindow: '1 minute', status: 'triggered', lastTriggered: '2024-12-24T10:28:00Z', notifyChannels: ['pagerduty', 'slack'] },
  { id: '3', name: 'Slow Response Time', condition: 'avg_duration > 2000ms', threshold: 2000, timeWindow: '5 minutes', status: 'paused', lastTriggered: '2024-12-23T15:45:00Z', notifyChannels: ['slack'] },
  { id: '4', name: 'Bot Traffic Spike', condition: 'bot_requests > 100', threshold: 100, timeWindow: '1 minute', status: 'active', lastTriggered: null, notifyChannels: ['email'] }
]

const mockSavedViews: SavedView[] = [
  { id: '1', name: 'All Errors', filters: { level: ['error', 'critical'] }, isDefault: false, createdAt: '2024-12-01' },
  { id: '2', name: 'Login Activity', filters: { accessType: ['login', 'logout'] }, isDefault: false, createdAt: '2024-12-10' },
  { id: '3', name: 'Suspicious Traffic', filters: { status: ['blocked', 'failed'] }, isDefault: false, createdAt: '2024-12-15' },
  { id: '4', name: 'Admin Actions', filters: { accessType: ['admin'] }, isDefault: true, createdAt: '2024-12-20' }
]

const mockStats: LogStats = {
  total: 45678,
  success: 42156,
  failed: 2345,
  blocked: 1089,
  suspicious: 234,
  avgDuration: 234,
  successRate: 92.3,
  errorRate: 5.1,
  requestsPerMinute: 156,
  uniqueUsers: 1234,
  uniqueIPs: 2567,
  bytesTransferred: 12345678901
}

export default function AccessLogsClient() {
  const [activeTab, setActiveTab] = useState('logs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [isLiveTail, setIsLiveTail] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesSearch = log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery)
      const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus
      const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
      const matchesType = selectedType === 'all' || log.accessType === selectedType
      return matchesSearch && matchesStatus && matchesLevel && matchesType
    })
  }, [searchQuery, selectedStatus, selectedLevel, selectedType])

  const getStatusColor = (status: LogStatus) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'blocked': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'text-gray-500'
      case 'info': return 'text-blue-500'
      case 'warn': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'critical': return 'text-red-700'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'failed': return XCircle
      case 'blocked': return ShieldOff
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Info
    }
  }

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'desktop': return Monitor
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      case 'bot': return Code
      default: return Monitor
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const openLogDialog = (log: AccessLog) => {
    setSelectedLog(log)
    setShowLogDialog(true)
  }

  const stats = [
    { label: 'Total Requests', value: mockStats.total.toLocaleString(), icon: Activity, change: '+12%', color: 'text-blue-600' },
    { label: 'Success Rate', value: `${mockStats.successRate}%`, icon: CheckCircle, change: '+2.3%', color: 'text-green-600' },
    { label: 'Error Rate', value: `${mockStats.errorRate}%`, icon: AlertCircle, change: '-1.2%', color: 'text-red-600' },
    { label: 'Avg Duration', value: `${mockStats.avgDuration}ms`, icon: Clock, change: '-15ms', color: 'text-purple-600' },
    { label: 'Req/min', value: mockStats.requestsPerMinute.toString(), icon: TrendingUp, change: '+8', color: 'text-cyan-600' },
    { label: 'Unique Users', value: mockStats.uniqueUsers.toLocaleString(), icon: Users, change: '+156', color: 'text-pink-600' },
    { label: 'Blocked', value: mockStats.blocked.toLocaleString(), icon: ShieldAlert, change: '+23', color: 'text-orange-600' },
    { label: 'Data Transfer', value: formatBytes(mockStats.bytesTransferred), icon: Database, change: '+2.3 GB', color: 'text-teal-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Logs</h1>
              <p className="text-gray-500 dark:text-gray-400">Datadog-level log monitoring and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isLiveTail ? 'default' : 'outline'}
              onClick={() => setIsLiveTail(!isLiveTail)}
              className={isLiveTail ? 'bg-green-500 text-white' : ''}
            >
              {isLiveTail ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Live Tail
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-80"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border shadow-sm">
            <TabsTrigger value="logs" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <FileText className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <Layers className="w-4 h-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="saved-views" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Views
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Filters Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Filters
                    <Button variant="ghost" size="sm" className="h-6 text-xs">Clear</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Status</label>
                    <div className="space-y-1">
                      {['all', 'success', 'failed', 'blocked', 'warning'].map(status => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors flex items-center justify-between ${
                            selectedStatus === status
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span>{status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                          <span className="text-xs text-gray-400">
                            {status === 'all' ? mockStats.total :
                             status === 'success' ? mockStats.success :
                             status === 'failed' ? mockStats.failed :
                             status === 'blocked' ? mockStats.blocked : 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Level</label>
                    <div className="space-y-1">
                      {['all', 'debug', 'info', 'warn', 'error', 'critical'].map(level => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                            selectedLevel === level
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {level === 'all' ? 'All Levels' : level.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Access Type</label>
                    <div className="space-y-1">
                      {['all', 'login', 'logout', 'api', 'admin', 'file', 'database'].map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                            selectedType === type
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logs List */}
              <div className="lg:col-span-4 space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{filteredLogs.length} logs</span>
                    {isLiveTail && (
                      <Badge className="bg-green-100 text-green-800 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'compact' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('compact')}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Logs */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <div className="divide-y dark:divide-gray-700">
                    {filteredLogs.map(log => {
                      const StatusIcon = getStatusIcon(log.status)
                      const DeviceIcon = getDeviceIcon(log.device.type)
                      return (
                        <div
                          key={log.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                          onClick={() => openLogDialog(log)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              log.status === 'success' ? 'bg-green-100 text-green-600' :
                              log.status === 'failed' ? 'bg-red-100 text-red-600' :
                              log.status === 'blocked' ? 'bg-orange-100 text-orange-600' :
                              log.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code className={`text-sm font-medium px-2 py-0.5 rounded ${
                                  log.statusCode >= 500 ? 'bg-red-100 text-red-800' :
                                  log.statusCode >= 400 ? 'bg-orange-100 text-orange-800' :
                                  log.statusCode >= 300 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>{log.statusCode}</code>
                                <Badge variant="outline" className="text-xs">{log.method}</Badge>
                                <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{log.resource}</span>
                                {log.isSuspicious && (
                                  <Badge className="bg-red-100 text-red-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Suspicious
                                  </Badge>
                                )}
                                {log.isBot && (
                                  <Badge className="bg-purple-100 text-purple-800">Bot</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {log.user && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {log.user.name}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {log.location.city}, {log.location.country}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {log.ipAddress}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DeviceIcon className="w-3 h-3" />
                                  {log.device.browser}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(log.duration)}
                                </span>
                              </div>
                              {log.errorMessage && (
                                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                  {log.errorMessage}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {log.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</div>
                              <div className="text-xs text-gray-400">{log.requestId}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  Detected Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPatterns.map(pattern => (
                    <div key={pattern.id} className="p-4 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{pattern.pattern}</h4>
                          <div className="text-sm text-gray-500 mt-1">
                            First seen: {pattern.firstSeen} • Last seen: {pattern.lastSeen}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(pattern.status)}>{pattern.status}</Badge>
                          <div className="text-2xl font-bold mt-1">{pattern.occurrences}</div>
                          <div className="text-xs text-gray-500">occurrences</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Affected:</span>
                        {pattern.affectedResources.map(resource => (
                          <code key={resource} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {resource}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-orange-500" />
                      Alert Rules
                    </div>
                    <Button size="sm">Create Rule</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="p-4 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{alert.name}</h4>
                        <Badge className={
                          alert.status === 'active' ? 'bg-green-100 text-green-800' :
                          alert.status === 'triggered' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {alert.status === 'triggered' && <BellRing className="w-3 h-3 mr-1" />}
                          {alert.status}
                        </Badge>
                      </div>
                      <code className="text-sm text-gray-600 dark:text-gray-400">{alert.condition}</code>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Window: {alert.timeWindow}</span>
                        {alert.lastTriggered && (
                          <span>Last triggered: {formatTimestamp(alert.lastTriggered)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {alert.notifyChannels.map(channel => (
                          <Badge key={channel} variant="outline" className="text-xs">{channel}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Recent Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAlerts.filter(a => a.lastTriggered).map(alert => (
                      <div key={alert.id} className="flex items-center gap-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <BellRing className="w-5 h-5 text-red-500" />
                        <div className="flex-1">
                          <div className="font-medium text-red-800 dark:text-red-300">{alert.name}</div>
                          <div className="text-sm text-red-600 dark:text-red-400">{alert.condition}</div>
                        </div>
                        <div className="text-sm text-red-500">{formatTimestamp(alert.lastTriggered!)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Views Tab */}
          <TabsContent value="saved-views" className="mt-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-purple-500" />
                    Saved Views
                  </div>
                  <Button size="sm">Save Current View</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockSavedViews.map(view => (
                    <Card key={view.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{view.name}</h4>
                          {view.isDefault && <Badge className="bg-purple-100 text-purple-800">Default</Badge>}
                        </div>
                        <div className="space-y-1">
                          {Object.entries(view.filters).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{key}:</span>
                              <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Created {view.createdAt}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Success', value: mockStats.success, color: 'bg-green-500', percentage: (mockStats.success / mockStats.total * 100).toFixed(1) },
                    { label: 'Failed', value: mockStats.failed, color: 'bg-red-500', percentage: (mockStats.failed / mockStats.total * 100).toFixed(1) },
                    { label: 'Blocked', value: mockStats.blocked, color: 'bg-orange-500', percentage: (mockStats.blocked / mockStats.total * 100).toFixed(1) },
                    { label: 'Suspicious', value: mockStats.suspicious, color: 'bg-yellow-500', percentage: (mockStats.suspicious / mockStats.total * 100).toFixed(1) }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <Progress value={parseFloat(item.percentage)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { location: 'San Francisco, USA', count: 12456, percentage: 27.3 },
                    { location: 'New York, USA', count: 8934, percentage: 19.5 },
                    { location: 'London, UK', count: 6789, percentage: 14.8 },
                    { location: 'Austin, USA', count: 5678, percentage: 12.4 },
                    { location: 'Seattle, USA', count: 4567, percentage: 10.0 }
                  ].map((item, index) => (
                    <div key={item.location} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.location}</div>
                        <div className="text-xs text-gray-500">{item.count.toLocaleString()} requests</div>
                      </div>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-500" />
                    Device Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { device: 'Desktop', icon: Monitor, count: 28456, percentage: 62.3, color: 'text-blue-500' },
                    { device: 'Mobile', icon: Smartphone, count: 12345, percentage: 27.0, color: 'text-green-500' },
                    { device: 'Tablet', icon: Tablet, count: 3456, percentage: 7.6, color: 'text-purple-500' },
                    { device: 'Bot', icon: Code, count: 1421, percentage: 3.1, color: 'text-red-500' }
                  ].map(item => (
                    <div key={item.device} className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{item.device}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Log Retention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Retention Period</h4>
                      <p className="text-sm text-gray-500">How long to keep logs</p>
                    </div>
                    <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700">
                    <div>
                      <h4 className="font-medium">Archive Logs</h4>
                      <p className="text-sm text-gray-500">Move old logs to cold storage</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Archive className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Slack', status: 'connected', icon: '💬' },
                    { name: 'PagerDuty', status: 'connected', icon: '🚨' },
                    { name: 'Email', status: 'connected', icon: '📧' },
                    { name: 'Webhook', status: 'not connected', icon: '🔗' }
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{integration.status}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedLog && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedLog.status)
                      return (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedLog.status === 'success' ? 'bg-green-100 text-green-600' :
                          selectedLog.status === 'failed' ? 'bg-red-100 text-red-600' :
                          selectedLog.status === 'blocked' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                      )
                    })()}
                    <div>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        <code className={`text-lg font-medium px-2 py-0.5 rounded ${
                          selectedLog.statusCode >= 500 ? 'bg-red-100 text-red-800' :
                          selectedLog.statusCode >= 400 ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>{selectedLog.statusCode}</code>
                        <Badge variant="outline">{selectedLog.method}</Badge>
                        <Badge className={getStatusColor(selectedLog.status)}>{selectedLog.status}</Badge>
                      </DialogTitle>
                      <code className="text-sm text-gray-500 font-mono">{selectedLog.resource}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] mt-4">
                <div className="space-y-6 pr-4">
                  {/* Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Duration</div>
                      <div className="text-xl font-semibold">{formatDuration(selectedLog.duration)}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Request Size</div>
                      <div className="text-xl font-semibold">{formatBytes(selectedLog.requestSize)}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Response Size</div>
                      <div className="text-xl font-semibold">{formatBytes(selectedLog.responseSize)}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-sm text-gray-500 mb-1">Timestamp</div>
                      <div className="text-sm font-medium">{formatTimestamp(selectedLog.timestamp)}</div>
                    </div>
                  </div>

                  {/* User Info */}
                  {selectedLog.user && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        User
                      </h3>
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{selectedLog.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedLog.user.name}</div>
                          <div className="text-sm text-gray-500">{selectedLog.user.email}</div>
                          <div className="text-xs text-gray-400">ID: {selectedLog.user.id}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location & Device */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">IP Address</span>
                          <code className="font-mono">{selectedLog.ipAddress}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">City</span>
                          <span>{selectedLog.location.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Country</span>
                          <span>{selectedLog.location.country}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Device
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type</span>
                          <span className="capitalize">{selectedLog.device.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Browser</span>
                          <span>{selectedLog.device.browser} {selectedLog.device.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">OS</span>
                          <span>{selectedLog.device.os}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Info */}
                  {selectedLog.errorMessage && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        Error
                      </h3>
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="font-medium text-red-800 dark:text-red-300 mb-2">{selectedLog.errorMessage}</div>
                        {selectedLog.stackTrace && (
                          <pre className="text-xs text-red-600 dark:text-red-400 overflow-x-auto">{selectedLog.stackTrace}</pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="font-semibold mb-3">Metadata</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Request ID</span>
                        <code className="font-mono">{selectedLog.requestId}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Session ID</span>
                        <code className="font-mono">{selectedLog.sessionId || 'N/A'}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">User Agent</span>
                        <span className="text-right max-w-md truncate">{selectedLog.userAgent}</span>
                      </div>
                      {selectedLog.referrer && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Referrer</span>
                          <span className="text-right max-w-md truncate">{selectedLog.referrer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Context
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Session
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLog.isSuspicious && (
                    <Button variant="outline" className="text-red-600">
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Block IP
                    </Button>
                  )}
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save to View
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
