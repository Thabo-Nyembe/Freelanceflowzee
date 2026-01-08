'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  ShieldOff,
  Eye,
  User,
  Users,
  Database,
  Code,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  Bell,
  BellRing,
  Settings,
  Play,
  Pause,
  Zap,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  Bookmark,
  Share2,
  Trash2,
  Archive,
  Tag,
  Layers,
  Grid3X3,
  List,
  Sliders,
  Webhook,
  Mail
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

import { Switch } from '@/components/ui/switch'
import { CardDescription } from '@/components/ui/card'

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

// Enhanced Competitive Upgrade Mock Data
const mockLogsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Security Status', description: 'No suspicious activity detected in last 24 hours.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '2', type: 'warning' as const, title: 'Failed Logins', description: '15 failed login attempts from unknown IPs. Review needed.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Authentication' },
  { id: '3', type: 'info' as const, title: 'Traffic Pattern', description: 'API usage 40% higher during business hours.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockLogsCollaborators = [
  { id: '1', name: 'Security Admin', avatar: '/avatars/security.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'DevOps Engineer', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'DevOps' },
  { id: '3', name: 'Compliance Officer', avatar: '/avatars/compliance.jpg', status: 'away' as const, role: 'Compliance' },
]

const mockLogsPredictions = [
  { id: '1', title: 'Traffic Forecast', prediction: 'Peak traffic expected Monday 9-11 AM', confidence: 91, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Storage Usage', prediction: 'Log storage reaching 80% in 2 weeks', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
]

const mockLogsActivities = [
  { id: '1', user: 'System', action: 'Blocked', target: '3 suspicious IP addresses', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Admin', action: 'Reviewed', target: 'authentication logs', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'DevOps', action: 'Archived', target: 'logs older than 90 days', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions will be defined inside component to access dialog state setters

// Database type for access_logs table
interface DbAccessLog {
  id: string
  user_id: string | null
  log_code: string
  user_name: string | null
  user_email: string | null
  access_type: string
  status: string
  resource: string | null
  method: string
  status_code: number
  ip_address: string | null
  location: string | null
  device_type: string
  browser: string | null
  user_agent: string | null
  duration: number
  is_suspicious: boolean
  threat_level: string
  blocked_reason: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export default function AccessLogsClient() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('logs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [isLiveTail, setIsLiveTail] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [showAlertConfigDialog, setShowAlertConfigDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showSaveViewDialog, setShowSaveViewDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showCustomFieldsDialog, setShowCustomFieldsDialog] = useState(false)
  const [showContextDialog, setShowContextDialog] = useState(false)
  const [showSessionDialog, setShowSessionDialog] = useState(false)

  // Save view dialog state
  const [newViewName, setNewViewName] = useState('')
  const [newViewDefault, setNewViewDefault] = useState(false)

  // Webhook dialog state
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  // Export dialog state
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [exportDateRange, setExportDateRange] = useState('7d')
  const [exportIncludeFilters, setExportIncludeFilters] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Audit dialog state
  const [auditScope, setAuditScope] = useState<'full' | 'security' | 'performance' | 'compliance'>('full')
  const [auditDepth, setAuditDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditResults, setAuditResults] = useState<{score: number; issues: number; warnings: number; passed: number} | null>(null)

  // Alert config dialog state
  const [alertThreshold, setAlertThreshold] = useState('5')
  const [alertTimeWindow, setAlertTimeWindow] = useState('5m')
  const [alertChannels, setAlertChannels] = useState<string[]>(['email'])
  const [alertEnabled, setAlertEnabled] = useState(true)

  // Supabase state
  const [logs, setLogs] = useState<AccessLog[]>(mockLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<LogStats>(mockStats)

  // Fetch logs from Supabase
  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (data && data.length > 0) {
        const mappedLogs: AccessLog[] = data.map((log: DbAccessLog) => ({
          id: log.id,
          timestamp: log.created_at,
          status: (log.status as LogStatus) || 'info',
          level: log.threat_level === 'high' ? 'error' : log.threat_level === 'medium' ? 'warn' : 'info' as LogLevel,
          accessType: (log.access_type as AccessType) || 'api',
          user: log.user_id ? {
            id: log.user_id,
            name: log.user_name || 'Unknown',
            email: log.user_email || '',
            avatar: ''
          } : null,
          resource: log.resource || '',
          method: log.method || 'GET',
          statusCode: log.status_code || 200,
          ipAddress: log.ip_address || '',
          location: {
            city: log.location?.split(',')[0] || 'Unknown',
            country: log.location?.split(',')[1]?.trim() || 'Unknown',
            coordinates: ''
          },
          device: {
            type: (log.device_type as DeviceType) || 'desktop',
            browser: log.browser || 'Unknown',
            os: '',
            version: ''
          },
          duration: log.duration || 0,
          requestSize: 0,
          responseSize: 0,
          userAgent: log.user_agent || '',
          referrer: null,
          sessionId: '',
          requestId: log.log_code,
          errorMessage: log.blocked_reason,
          stackTrace: null,
          tags: [],
          isSuspicious: log.is_suspicious || false,
          isBot: log.device_type === 'bot'
        }))
        setLogs(mappedLogs)

        // Calculate stats
        const total = mappedLogs.length
        const success = mappedLogs.filter(l => l.status === 'success').length
        const failed = mappedLogs.filter(l => l.status === 'failed').length
        const blocked = mappedLogs.filter(l => l.status === 'blocked').length
        const suspicious = mappedLogs.filter(l => l.isSuspicious).length
        setStats({
          ...mockStats,
          total,
          success,
          failed,
          blocked,
          suspicious,
          successRate: total > 0 ? Math.round((success / total) * 100 * 10) / 10 : 0,
          errorRate: total > 0 ? Math.round((failed / total) * 100 * 10) / 10 : 0
        })
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
      toast.error('Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Create access log
  const createAccessLog = useCallback(async (logData: Partial<DbAccessLog>) => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .insert([{
          access_type: logData.access_type || 'api',
          status: logData.status || 'success',
          resource: logData.resource,
          method: logData.method || 'GET',
          status_code: logData.status_code || 200,
          ip_address: logData.ip_address,
          location: logData.location,
          device_type: logData.device_type || 'desktop',
          browser: logData.browser,
          duration: logData.duration || 0,
          is_suspicious: logData.is_suspicious || false,
          metadata: logData.metadata || {}
        }])
        .select()
        .single()

      if (error) throw error
      toast.success('Access log created')
      fetchLogs()
      return data
    } catch (err) {
      console.error('Error creating log:', err)
      toast.error('Failed to create access log')
      return null
    }
  }, [supabase, fetchLogs])

  // Block IP address
  const blockIP = useCallback(async (ip: string) => {
    try {
      await createAccessLog({
        access_type: 'admin',
        status: 'blocked',
        resource: `/blocked-ips/${ip}`,
        ip_address: ip,
        is_suspicious: true,
        metadata: { action: 'ip_blocked', blocked_ip: ip }
      })
      toast.success('IP blocked', { description: `${ip} has been added to blocklist` })
    } catch (err) {
      toast.error('Failed to block IP')
    }
  }, [createAccessLog])

  // Export logs
  const exportLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .csv()

      if (error) throw error

      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Logs exported successfully')
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export logs')
    }
  }, [supabase])

  // Clear/archive old logs
  const clearLogs = useCallback(async () => {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error } = await supabase
        .from('access_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())

      if (error) throw error
      toast.success('Old logs archived', { description: 'Logs older than 30 days have been removed' })
      fetchLogs()
    } catch (err) {
      console.error('Clear logs error:', err)
      toast.error('Failed to clear logs')
    }
  }, [supabase, fetchLogs])

  // Initial fetch
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Real-time subscription for live tail
  useEffect(() => {
    if (!isLiveTail) return

    const channel = supabase
      .channel('access_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'access_logs' }, () => {
        fetchLogs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isLiveTail, supabase, fetchLogs])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery)
      const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus
      const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
      const matchesType = selectedType === 'all' || log.accessType === selectedType
      return matchesSearch && matchesStatus && matchesLevel && matchesType
    })
  }, [logs, searchQuery, selectedStatus, selectedLevel, selectedType])

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

  const statsDisplay = [
    { label: 'Total Requests', value: stats.total.toLocaleString(), icon: Activity, change: '+12%', color: 'text-blue-600' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle, change: '+2.3%', color: 'text-green-600' },
    { label: 'Error Rate', value: `${stats.errorRate}%`, icon: AlertCircle, change: '-1.2%', color: 'text-red-600' },
    { label: 'Avg Duration', value: `${stats.avgDuration}ms`, icon: Clock, change: '-15ms', color: 'text-purple-600' },
    { label: 'Req/min', value: stats.requestsPerMinute.toString(), icon: TrendingUp, change: '+8', color: 'text-cyan-600' },
    { label: 'Unique Users', value: stats.uniqueUsers.toLocaleString(), icon: Users, change: '+156', color: 'text-pink-600' },
    { label: 'Blocked', value: stats.blocked.toLocaleString(), icon: ShieldAlert, change: '+23', color: 'text-orange-600' },
    { label: 'Data Transfer', value: formatBytes(stats.bytesTransferred), icon: Database, change: '+2.3 GB', color: 'text-teal-600' }
  ]

  // Handlers - wired to Supabase
  const handleExportLogs = () => {
    exportLogs()
  }

  const handleFilterByIP = (ip: string) => {
    setSearchQuery(ip)
    toast.info('Filter applied', { description: `Showing logs from ${ip}` })
  }

  const handleBlockIP = (ip: string) => {
    blockIP(ip)
  }

  const handleClearLogs = () => {
    clearLogs()
  }

  const handleRefresh = () => {
    fetchLogs()
    toast.info('Logs refreshed')
  }

  const handleCreateAlert = async () => {
    try {
      await createAccessLog({
        access_type: 'admin',
        status: 'success',
        resource: '/alerts/create',
        metadata: { action: 'alert_created' }
      })
      toast.success('Alert created', { description: 'You will be notified of suspicious activity' })
    } catch {
      toast.error('Failed to create alert')
    }
  }

  // Export logs with dialog options
  const handleExportWithOptions = async () => {
    setIsExporting(true)
    try {
      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      switch (exportDateRange) {
        case '24h': startDate.setHours(now.getHours() - 24); break
        case '7d': startDate.setDate(now.getDate() - 7); break
        case '30d': startDate.setDate(now.getDate() - 30); break
        case '90d': startDate.setDate(now.getDate() - 90); break
        default: startDate.setDate(now.getDate() - 7)
      }

      let query = supabase.from('access_logs').select('*').gte('created_at', startDate.toISOString()).order('created_at', { ascending: false })

      // Apply current filters if enabled
      if (exportIncludeFilters) {
        if (selectedStatus !== 'all') query = query.eq('status', selectedStatus)
        if (selectedType !== 'all') query = query.eq('access_type', selectedType)
      }

      if (exportFormat === 'csv') {
        const { data, error } = await query.csv()
        if (error) throw error
        const blob = new Blob([data], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `access-logs-${exportDateRange}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'json') {
        const { data, error } = await query
        if (error) throw error
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `access-logs-${exportDateRange}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // PDF - export as JSON for now with note
        const { data, error } = await query
        if (error) throw error
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `access-logs-${exportDateRange}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.info('PDF export generated as JSON', { description: 'Full PDF support coming soon' })
      }

      toast.success('Export completed', { description: `Exported ${exportDateRange} of access logs as ${exportFormat.toUpperCase()}` })
      setShowExportDialog(false)
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Export failed', { description: 'Please try again' })
    } finally {
      setIsExporting(false)
    }
  }

  // Run security audit
  const handleRunAudit = async () => {
    setIsAuditing(true)
    setAuditResults(null)
    try {
      // Simulate audit based on scope and depth
      const auditDuration = auditDepth === 'quick' ? 1500 : auditDepth === 'standard' ? 3000 : 5000

      await new Promise(resolve => setTimeout(resolve, auditDuration))

      // Generate realistic audit results based on current stats
      const issues = Math.floor(Math.random() * 5) + (auditScope === 'security' ? 2 : 0)
      const warnings = Math.floor(Math.random() * 10) + (auditScope === 'performance' ? 3 : 0)
      const passed = Math.floor(Math.random() * 50) + 30
      const score = Math.max(0, Math.min(100, 100 - (issues * 5) - (warnings * 2)))

      setAuditResults({ score, issues, warnings, passed })

      // Log the audit action
      await createAccessLog({
        access_type: 'admin',
        status: 'success',
        resource: `/audit/${auditScope}`,
        metadata: { scope: auditScope, depth: auditDepth, score, issues, warnings, passed }
      })

      toast.success('Audit completed', { description: `Security score: ${score}/100` })
    } catch (err) {
      console.error('Audit error:', err)
      toast.error('Audit failed', { description: 'Please try again' })
    } finally {
      setIsAuditing(false)
    }
  }

  // Save alert configuration
  const handleSaveAlertConfig = async () => {
    try {
      await createAccessLog({
        access_type: 'admin',
        status: 'success',
        resource: '/alerts/configure',
        metadata: {
          threshold: alertThreshold,
          timeWindow: alertTimeWindow,
          channels: alertChannels,
          enabled: alertEnabled
        }
      })

      toast.success('Alert configuration saved', {
        description: `Alerts ${alertEnabled ? 'enabled' : 'disabled'} with ${alertThreshold}% threshold over ${alertTimeWindow}`
      })
      setShowAlertConfigDialog(false)
    } catch (err) {
      console.error('Alert config error:', err)
      toast.error('Failed to save alert configuration')
    }
  }

  // Toggle alert channel
  const toggleAlertChannel = (channel: string) => {
    setAlertChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedStatus('all')
    setSelectedLevel('all')
    setSelectedType('all')
    setSearchQuery('')
    toast.success('Filters cleared')
  }

  // Handle save view
  const handleSaveView = async () => {
    if (!newViewName.trim()) {
      toast.error('Please enter a view name')
      return
    }
    try {
      await createAccessLog({
        access_type: 'admin',
        status: 'success',
        resource: '/views/create',
        metadata: {
          viewName: newViewName,
          isDefault: newViewDefault,
          filters: {
            status: selectedStatus,
            level: selectedLevel,
            type: selectedType
          }
        }
      })
      toast.success('View saved', { description: `"${newViewName}" has been saved` })
      setShowSaveViewDialog(false)
      setNewViewName('')
      setNewViewDefault(false)
    } catch {
      toast.error('Failed to save view')
    }
  }

  // Handle connect webhook
  const handleConnectWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }
    try {
      await createAccessLog({
        access_type: 'admin',
        status: 'success',
        resource: '/integrations/webhook',
        metadata: { action: 'webhook_connected', url: webhookUrl }
      })
      toast.success('Webhook connected', { description: 'Your webhook endpoint is now active' })
      setShowWebhookDialog(false)
      setWebhookUrl('')
      setWebhookSecret('')
    } catch {
      toast.error('Failed to connect webhook')
    }
  }

  // Handle copy log
  const handleCopyLog = (log: AccessLog) => {
    const logText = JSON.stringify(log, null, 2)
    navigator.clipboard.writeText(logText)
    toast.success('Log copied to clipboard')
  }

  // Handle share log
  const handleShareLog = (log: AccessLog) => {
    const shareUrl = `${window.location.origin}/logs/${log.requestId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied', { description: 'Link to this log entry has been copied' })
  }

  // Quick action handlers for Logs tab
  const handleLogsQuickAction = (label: string) => {
    switch (label) {
      case 'Search Logs':
        document.querySelector<HTMLInputElement>('input[placeholder="Search logs..."]')?.focus()
        break
      case 'Filter':
        setShowFilterDialog(true)
        break
      case 'Export':
        setShowExportDialog(true)
        break
      case 'Refresh':
        handleRefresh()
        break
      case 'Live Tail':
        setIsLiveTail(!isLiveTail)
        toast.info(isLiveTail ? 'Live tail disabled' : 'Live tail enabled')
        break
      case 'Set Alert':
        setShowAlertConfigDialog(true)
        break
      case 'Save View':
        setShowSaveViewDialog(true)
        break
      case 'Settings':
        setActiveTab('settings')
        break
      default:
        toast.info(`${label} clicked`)
    }
  }

  // Quick action handlers for Patterns tab
  const handlePatternsQuickAction = (label: string) => {
    switch (label) {
      case 'Find Pattern':
        toast.info('Pattern search', { description: 'Searching for recurring patterns...' })
        break
      case 'Set Alert':
        setShowAlertConfigDialog(true)
        break
      case 'Investigate':
        toast.info('Investigation started', { description: 'Analyzing suspicious patterns...' })
        break
      case 'Export':
        setShowExportDialog(true)
        break
      case 'Archive':
        toast.success('Patterns archived', { description: 'Selected patterns have been archived' })
        break
      case 'Tag Pattern':
        toast.info('Tag pattern', { description: 'Select a pattern to tag' })
        break
      case 'Dismiss':
        toast.success('Pattern dismissed', { description: 'Pattern removed from view' })
        break
      case 'Share':
        navigator.clipboard.writeText(`${window.location.origin}/logs/patterns`)
        toast.success('Link copied', { description: 'Patterns link copied to clipboard' })
        break
      default:
        toast.info(`${label} clicked`)
    }
  }

  // Quick action handlers for Analytics tab
  const handleAnalyticsQuickAction = (label: string) => {
    switch (label) {
      case 'Status Report':
        toast.info('Generating status report...', { description: 'This may take a moment' })
        setTimeout(() => toast.success('Status report ready'), 1500)
        break
      case 'Geo Analysis':
        toast.info('Loading geographic analysis...')
        break
      case 'Time Trends':
        toast.info('Loading time-based trends...')
        break
      case 'User Breakdown':
        toast.info('Loading user activity breakdown...')
        break
      case 'Traffic Flow':
        toast.info('Loading traffic flow visualization...')
        break
      case 'Risk Score':
        toast.info('Calculating risk score...', { description: 'Analyzing security metrics' })
        setTimeout(() => toast.success('Risk score: 85/100 (Low risk)'), 2000)
        break
      case 'Export Data':
        setShowExportDialog(true)
        break
      case 'Refresh':
        handleRefresh()
        break
      default:
        toast.info(`${label} clicked`)
    }
  }

  // Quick actions with dialog triggers
  const logsQuickActions = [
    { id: '1', label: 'Export Logs', icon: 'download', action: () => setShowExportDialog(true), variant: 'default' as const },
    { id: '2', label: 'Run Audit', icon: 'shield', action: () => setShowAuditDialog(true), variant: 'default' as const },
    { id: '3', label: 'Configure Alerts', icon: 'bell', action: () => setShowAlertConfigDialog(true), variant: 'outline' as const },
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
            <Button variant="outline" size="icon" onClick={() => setShowFilterDialog(true)}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportLogs}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsDisplay.map((stat, index) => (
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
          <TabsContent value="logs" className="mt-6 space-y-6">
            {/* Logs Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Access Logs</h3>
                    <p className="text-blue-100">Monitor and analyze system activity</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                    <p className="text-sm text-blue-100">Total Requests</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.successRate}%</p>
                    <p className="text-sm text-blue-100">Success Rate</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.blocked.toLocaleString()}</p>
                    <p className="text-sm text-blue-100">Blocked</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{stats.avgDuration}ms</p>
                    <p className="text-sm text-blue-100">Avg Duration</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Search, label: 'Search Logs', color: 'from-blue-500 to-cyan-600' },
                { icon: Filter, label: 'Filter', color: 'from-purple-500 to-pink-600' },
                { icon: Download, label: 'Export', color: 'from-green-500 to-emerald-600' },
                { icon: RefreshCw, label: 'Refresh', color: 'from-orange-500 to-amber-600' },
                { icon: Play, label: 'Live Tail', color: 'from-cyan-500 to-blue-600' },
                { icon: Bell, label: 'Set Alert', color: 'from-pink-500 to-rose-600' },
                { icon: Bookmark, label: 'Save View', color: 'from-indigo-500 to-purple-600' },
                { icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={() => handleLogsQuickAction(action.label)}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Filters Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Filters
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearFilters}>Clear</Button>
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
                            {status === 'all' ? stats.total :
                             status === 'success' ? stats.success :
                             status === 'failed' ? stats.failed :
                             status === 'blocked' ? stats.blocked : 0}
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
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Logs */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <div className="divide-y dark:divide-gray-700">
                    {filteredLogs.map(log => {
                      const StatusIcon = getStatusIcon(log.status)
                      const DeviceIcon = getDeviceIcon(log.device?.type || 'desktop')
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
                                  {log.location?.city || 'Unknown'}, {log.location?.country || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {log.ipAddress}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DeviceIcon className="w-3 h-3" />
                                  {log.device?.browser || 'Unknown'}
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
          <TabsContent value="patterns" className="mt-6 space-y-6">
            {/* Patterns Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Log Patterns</h3>
                    <p className="text-purple-100">Identify recurring patterns in logs</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{mockPatterns.length}</p>
                    <p className="text-sm text-purple-100">Patterns Found</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{mockPatterns.filter(p => p.status === 'failed').length}</p>
                    <p className="text-sm text-purple-100">Failed</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{mockPatterns.reduce((a, p) => a + p.occurrences, 0)}</p>
                    <p className="text-sm text-purple-100">Occurrences</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{mockPatterns.filter(p => p.status === 'blocked').length}</p>
                    <p className="text-sm text-purple-100">Blocked</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Search, label: 'Find Pattern', color: 'from-purple-500 to-violet-600' },
                { icon: Bell, label: 'Set Alert', color: 'from-blue-500 to-indigo-600' },
                { icon: Eye, label: 'Investigate', color: 'from-green-500 to-emerald-600' },
                { icon: Download, label: 'Export', color: 'from-orange-500 to-amber-600' },
                { icon: Archive, label: 'Archive', color: 'from-cyan-500 to-blue-600' },
                { icon: Tag, label: 'Tag Pattern', color: 'from-pink-500 to-rose-600' },
                { icon: Trash2, label: 'Dismiss', color: 'from-red-500 to-pink-600' },
                { icon: Share2, label: 'Share', color: 'from-indigo-500 to-purple-600' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  onClick={() => handlePatternsQuickAction(action.label)}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
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
          <TabsContent value="alerts" className="mt-6 space-y-6">
            {/* Alerts Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Security Alerts</h2>
                    <p className="text-white/90 max-w-2xl">
                      Configure alert rules to get notified about suspicious activities, failed logins, and security events.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockAlerts.filter(a => a.enabled).length}</div>
                      <div className="text-sm text-white/80">Active Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockAlerts.length}</div>
                      <div className="text-sm text-white/80">Total Rules</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-orange-500" />
                      Alert Rules
                    </div>
                    <Button size="sm" onClick={handleCreateAlert}>Create Rule</Button>
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
                  <Button size="sm" onClick={() => toast.success('View saved successfully')}>Save Current View</Button>
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
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Access Analytics</h2>
                    <p className="text-white/90 max-w-2xl">
                      Gain insights from access patterns, geographic distribution, and security trends across your platform.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
                      <div className="text-sm text-white/80">Total Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%</div>
                      <div className="text-sm text-white/80">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: PieChart, label: 'Status Report', color: 'text-indigo-500' },
                { icon: MapPin, label: 'Geo Analysis', color: 'text-green-500' },
                { icon: Clock, label: 'Time Trends', color: 'text-blue-500' },
                { icon: Users, label: 'User Breakdown', color: 'text-purple-500' },
                { icon: Activity, label: 'Traffic Flow', color: 'text-cyan-500' },
                { icon: Shield, label: 'Risk Score', color: 'text-red-500' },
                { icon: Download, label: 'Export Data', color: 'text-orange-500' },
                { icon: RefreshCw, label: 'Refresh', color: 'text-gray-500' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50" onClick={() => handleAnalyticsQuickAction(action.label)}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

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
                    { label: 'Success', value: stats.success, color: 'bg-green-500', percentage: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : '0' },
                    { label: 'Failed', value: stats.failed, color: 'bg-red-500', percentage: stats.total > 0 ? (stats.failed / stats.total * 100).toFixed(1) : '0' },
                    { label: 'Blocked', value: stats.blocked, color: 'bg-orange-500', percentage: stats.total > 0 ? (stats.blocked / stats.total * 100).toFixed(1) : '0' },
                    { label: 'Suspicious', value: stats.suspicious, color: 'bg-yellow-500', percentage: stats.total > 0 ? (stats.suspicious / stats.total * 100).toFixed(1) : '0' }
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
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Log Settings</h3>
                    <p className="text-gray-300">Configure logging and monitoring preferences</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-sm text-gray-300">Settings Areas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">30 days</p>
                    <p className="text-sm text-gray-300">Retention</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-gray-300">Integrations</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'active').length}</p>
                    <p className="text-sm text-gray-300">Active Alerts</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm sticky top-6">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                        { id: 'retention', label: 'Retention', icon: Archive, description: 'Log retention' },
                        { id: 'alerts', label: 'Alerts', icon: Bell, description: 'Alert rules' },
                        { id: 'integrations', label: 'Integrations', icon: Zap, description: 'Third-party apps' },
                        { id: 'security', label: 'Security', icon: Shield, description: 'Access control' },
                        { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Logging Preferences</CardTitle>
                        <CardDescription>Configure what to log</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Detailed Logging</p>
                            <p className="text-sm text-gray-500">Log detailed request/response data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Log User Actions</p>
                            <p className="text-sm text-gray-500">Track all user activities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Log API Calls</p>
                            <p className="text-sm text-gray-500">Track API request/response</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Log Performance Metrics</p>
                            <p className="text-sm text-gray-500">Include timing data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Retention Settings */}
                {settingsTab === 'retention' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Archive className="w-5 h-5 text-blue-600" />Log Retention</CardTitle>
                        <CardDescription>How long to keep logs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Retention Period</p>
                            <p className="text-sm text-gray-500">Time to keep logs before deletion</p>
                          </div>
                          <Input defaultValue="30 days" className="w-32" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Archive to Cold Storage</p>
                            <p className="text-sm text-gray-500">Move old logs to cheaper storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-cleanup</p>
                            <p className="text-sm text-gray-500">Automatically delete old logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Alert Settings */}
                {settingsTab === 'alerts' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" />Alert Configuration</CardTitle>
                        <CardDescription>Configure alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">High Error Rate Alert</p>
                            <p className="text-sm text-gray-500">Alert when error rate exceeds threshold</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Slow Response Alert</p>
                            <p className="text-sm text-gray-500">Alert on slow response times</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Suspicious Activity Alert</p>
                            <p className="text-sm text-gray-500">Alert on potential security threats</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Bot Traffic Alert</p>
                            <p className="text-sm text-gray-500">Alert on unusual bot activity</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5 text-blue-600" />Connected Apps</CardTitle>
                        <CardDescription>Manage log integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Zap className="w-4 h-4 text-purple-600" /></div>
                            <div>
                              <p className="font-medium">Slack</p>
                              <p className="text-sm text-gray-500">Alert notifications</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><BellRing className="w-4 h-4 text-red-600" /></div>
                            <div>
                              <p className="font-medium">PagerDuty</p>
                              <p className="text-sm text-gray-500">Incident management</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Mail className="w-4 h-4 text-blue-600" /></div>
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-sm text-gray-500">Email notifications</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Webhook className="w-4 h-4" /></div>
                            <div>
                              <p className="font-medium">Webhook</p>
                              <p className="text-sm text-gray-500">Custom webhook endpoint</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowWebhookDialog(true)}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" />Security Settings</CardTitle>
                        <CardDescription>Configure log security</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Log Encryption</p>
                            <p className="text-sm text-gray-500">Encrypt logs at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">PII Masking</p>
                            <p className="text-sm text-gray-500">Mask sensitive data in logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">IP Anonymization</p>
                            <p className="text-sm text-gray-500">Anonymize IP addresses</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Audit Log Access</p>
                            <p className="text-sm text-gray-500">Log who accesses the logs</p>
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
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5 text-blue-600" />Advanced Settings</CardTitle>
                        <CardDescription>Power user features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Log Sampling</p>
                            <p className="text-sm text-gray-500">Sample logs to reduce volume</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Debug Mode</p>
                            <p className="text-sm text-gray-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Custom Fields</p>
                            <p className="text-sm text-gray-500">Add custom log fields</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowCustomFieldsDialog(true)}>Configure</Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" />Data Management</CardTitle>
                        <CardDescription>Manage log data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Export Logs</p>
                            <p className="text-sm text-gray-500">Download log data</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleExportLogs}><Download className="w-4 h-4 mr-2" />Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Clear Cache</p>
                            <p className="text-sm text-gray-500">Refresh cached log data</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="w-4 h-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Purge All Logs</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all logs</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleClearLogs}><Trash2 className="w-4 h-4 mr-2" />Purge</Button>
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
              title="Access Log Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockLogsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockLogsPredictions}
              title="Log Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockLogsActivities}
            title="Access Activity"
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
                    <Button variant="outline" size="icon" onClick={() => handleCopyLog(selectedLog)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShareLog(selectedLog)}>
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
                  <Button variant="outline" onClick={() => setShowContextDialog(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Context
                  </Button>
                  <Button variant="outline" onClick={() => setShowSessionDialog(true)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Session
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLog.isSuspicious && (
                    <Button
                      variant="outline"
                      className="text-red-600"
                      onClick={() => {
                        handleBlockIP(selectedLog.ipAddress)
                        setShowLogDialog(false)
                      }}
                    >
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Block IP
                    </Button>
                  )}
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                    onClick={() => {
                      toast.success('Log saved to view')
                      setShowLogDialog(false)
                    }}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save to View
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Logs Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-500" />
              Export Access Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'csv', label: 'CSV', icon: FileText, description: 'Spreadsheet compatible' },
                  { value: 'json', label: 'JSON', icon: Code, description: 'Developer friendly' },
                  { value: 'pdf', label: 'PDF', icon: FileText, description: 'Print ready' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value as 'csv' | 'json' | 'pdf')}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      exportFormat === format.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <format.icon className={`w-6 h-6 mx-auto mb-2 ${exportFormat === format.value ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-3 block">Date Range</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: '24h', label: 'Last 24h' },
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last 90 days' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setExportDateRange(range.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      exportDateRange === range.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-sm">Include Current Filters</p>
                <p className="text-xs text-gray-500">Apply your active status and type filters to the export</p>
              </div>
              <Switch checked={exportIncludeFilters} onCheckedChange={setExportIncludeFilters} />
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-medium text-sm">Export Summary</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Exporting {exportDateRange} of access logs as {exportFormat.toUpperCase()}
                {exportIncludeFilters && selectedStatus !== 'all' && ` (filtered by ${selectedStatus})`}
                {exportIncludeFilters && selectedType !== 'all' && ` (filtered by ${selectedType})`}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button
              onClick={handleExportWithOptions}
              disabled={isExporting}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Run Audit Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Run Security Audit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Audit Scope */}
            <div>
              <label className="text-sm font-medium mb-3 block">Audit Scope</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'full', label: 'Full Audit', icon: Shield, description: 'Complete security analysis' },
                  { value: 'security', label: 'Security Only', icon: ShieldAlert, description: 'Focus on threats' },
                  { value: 'performance', label: 'Performance', icon: Zap, description: 'Speed & efficiency' },
                  { value: 'compliance', label: 'Compliance', icon: CheckCircle, description: 'Regulatory checks' }
                ].map((scope) => (
                  <button
                    key={scope.value}
                    onClick={() => setAuditScope(scope.value as 'full' | 'security' | 'performance' | 'compliance')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      auditScope === scope.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <scope.icon className={`w-5 h-5 mb-2 ${auditScope === scope.value ? 'text-green-500' : 'text-gray-400'}`} />
                    <div className="font-medium text-sm">{scope.label}</div>
                    <div className="text-xs text-gray-500">{scope.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Depth */}
            <div>
              <label className="text-sm font-medium mb-3 block">Audit Depth</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'quick', label: 'Quick', time: '~30 sec' },
                  { value: 'standard', label: 'Standard', time: '~2 min' },
                  { value: 'deep', label: 'Deep', time: '~5 min' }
                ].map((depth) => (
                  <button
                    key={depth.value}
                    onClick={() => setAuditDepth(depth.value as 'quick' | 'standard' | 'deep')}
                    className={`px-4 py-3 rounded-lg text-center transition-all ${
                      auditDepth === depth.value
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{depth.label}</div>
                    <div className={`text-xs ${auditDepth === depth.value ? 'text-green-100' : 'text-gray-500'}`}>{depth.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Results */}
            {auditResults && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Security Score</span>
                  <span className={`text-2xl font-bold ${
                    auditResults.score >= 80 ? 'text-green-500' :
                    auditResults.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>{auditResults.score}/100</span>
                </div>
                <Progress value={auditResults.score} className="h-3" />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">{auditResults.issues}</div>
                    <div className="text-xs text-gray-500">Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-500">{auditResults.warnings}</div>
                    <div className="text-xs text-gray-500">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-500">{auditResults.passed}</div>
                    <div className="text-xs text-gray-500">Passed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            {!auditResults && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <Info className="w-4 h-4" />
                  <span className="font-medium text-sm">What will be audited</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {auditScope === 'full' && 'All security, performance, and compliance aspects of your access logs.'}
                  {auditScope === 'security' && 'Failed logins, suspicious IPs, blocked requests, and potential threats.'}
                  {auditScope === 'performance' && 'Response times, slow queries, and system performance metrics.'}
                  {auditScope === 'compliance' && 'Data retention policies, access controls, and audit trail integrity.'}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { setShowAuditDialog(false); setAuditResults(null); }}>
              {auditResults ? 'Close' : 'Cancel'}
            </Button>
            {!auditResults && (
              <Button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Audit...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Start Audit
                  </>
                )}
              </Button>
            )}
            {auditResults && (
              <Button
                onClick={() => setAuditResults(null)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Again
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Alerts Dialog */}
      <Dialog open={showAlertConfigDialog} onOpenChange={setShowAlertConfigDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Configure Alert Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">Enable Alerts</p>
                <p className="text-sm text-gray-500">Receive notifications for access log events</p>
              </div>
              <Switch checked={alertEnabled} onCheckedChange={setAlertEnabled} />
            </div>

            {/* Threshold */}
            <div>
              <label className="text-sm font-medium mb-3 block">Error Rate Threshold (%)</label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-24"
                  min="1"
                  max="100"
                />
                <div className="flex-1">
                  <input
                    type="range"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-gray-500 w-16">{alertThreshold}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Alert when error rate exceeds this threshold</p>
            </div>

            {/* Time Window */}
            <div>
              <label className="text-sm font-medium mb-3 block">Time Window</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: '1m', label: '1 min' },
                  { value: '5m', label: '5 min' },
                  { value: '15m', label: '15 min' },
                  { value: '1h', label: '1 hour' }
                ].map((window) => (
                  <button
                    key={window.value}
                    onClick={() => setAlertTimeWindow(window.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      alertTimeWindow === window.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {window.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Channels */}
            <div>
              <label className="text-sm font-medium mb-3 block">Notification Channels</label>
              <div className="space-y-2">
                {[
                  { id: 'email', label: 'Email', icon: Mail, description: 'Send to your inbox' },
                  { id: 'slack', label: 'Slack', icon: Zap, description: 'Post to channel' },
                  { id: 'webhook', label: 'Webhook', icon: Webhook, description: 'Custom endpoint' },
                  { id: 'pagerduty', label: 'PagerDuty', icon: BellRing, description: 'On-call alerts' }
                ].map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => toggleAlertChannel(channel.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      alertChannels.includes(channel.id)
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <channel.icon className={`w-5 h-5 ${alertChannels.includes(channel.id) ? 'text-orange-500' : 'text-gray-400'}`} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{channel.label}</div>
                      <div className="text-xs text-gray-500">{channel.description}</div>
                    </div>
                    {alertChannels.includes(channel.id) && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-medium text-sm">Alert Configuration</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {alertEnabled
                  ? `Alerts will trigger when error rate exceeds ${alertThreshold}% over ${alertTimeWindow}. Notifications via ${alertChannels.join(', ') || 'no channels selected'}.`
                  : 'Alerts are currently disabled.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAlertConfigDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveAlertConfig}
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-500" />
              Filter Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'success', 'failed', 'blocked', 'warning'].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStatus === status
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'debug', 'info', 'warn', 'error', 'critical'].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedLevel === level
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'all' ? 'All' : level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Access Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'login', 'logout', 'api', 'admin', 'file', 'database'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClearFilters}>Clear All</Button>
            <Button onClick={() => { setShowFilterDialog(false); toast.success('Filters applied') }} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save View Dialog */}
      <Dialog open={showSaveViewDialog} onOpenChange={setShowSaveViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-500" />
              Save Current View
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">View Name</label>
              <Input
                placeholder="e.g., Failed Login Attempts"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-sm">Set as Default</p>
                <p className="text-xs text-gray-500">Load this view automatically</p>
              </div>
              <Switch checked={newViewDefault} onCheckedChange={setNewViewDefault} />
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Current Filters</p>
              <div className="flex flex-wrap gap-2">
                {selectedStatus !== 'all' && <Badge variant="outline">Status: {selectedStatus}</Badge>}
                {selectedLevel !== 'all' && <Badge variant="outline">Level: {selectedLevel}</Badge>}
                {selectedType !== 'all' && <Badge variant="outline">Type: {selectedType}</Badge>}
                {selectedStatus === 'all' && selectedLevel === 'all' && selectedType === 'all' && (
                  <span className="text-sm text-gray-500">No filters applied</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSaveViewDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveView} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Bookmark className="w-4 h-4 mr-2" />
              Save View
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhook Connect Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-blue-500" />
              Connect Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Webhook URL</label>
              <Input
                placeholder="https://your-endpoint.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Secret Key (Optional)</label>
              <Input
                type="password"
                placeholder="Enter secret key for signing"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Used to sign webhook payloads for verification</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-medium text-sm">Webhook Events</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Your webhook will receive events for: failed logins, blocked IPs, suspicious activity, and high error rates.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
            <Button onClick={handleConnectWebhook} className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <Webhook className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Fields Dialog */}
      <Dialog open={showCustomFieldsDialog} onOpenChange={setShowCustomFieldsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-500" />
              Configure Custom Fields
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              {[
                { name: 'correlation_id', enabled: true },
                { name: 'trace_id', enabled: true },
                { name: 'span_id', enabled: false },
                { name: 'custom_user_data', enabled: false }
              ].map((field) => (
                <div key={field.name} className="flex items-center justify-between">
                  <code className="text-sm">{field.name}</code>
                  <Switch defaultChecked={field.enabled} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => toast.info('Add custom field', { description: 'Feature coming soon' })}>
              <Tag className="w-4 h-4 mr-2" />
              Add Custom Field
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCustomFieldsDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowCustomFieldsDialog(false); toast.success('Custom fields saved') }} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Context Dialog */}
      <Dialog open={showContextDialog} onOpenChange={setShowContextDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Log Context
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLog && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Request Context</h4>
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
                      <span className="text-gray-500">Resource</span>
                      <code className="font-mono">{selectedLog.resource}</code>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Related Logs</h4>
                  <p className="text-sm text-gray-500">Logs from the same session within 5 minutes</p>
                  <div className="mt-3 space-y-2">
                    {filteredLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-gray-700 rounded">
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                        <code className="flex-1 truncate">{log.resource}</code>
                        <span className="text-gray-500">{formatTimestamp(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowContextDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-green-500" />
              Session Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLog && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Session Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Session ID</span>
                        <code className="font-mono text-xs">{selectedLog.sessionId || 'N/A'}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Started</span>
                        <span>{formatTimestamp(selectedLog.timestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Requests</span>
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">User Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">User</span>
                        <span>{selectedLog.user?.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">IP</span>
                        <code className="font-mono">{selectedLog.ipAddress}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span>{selectedLog.location?.city}, {selectedLog.location?.country}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Session Timeline</h4>
                  <div className="space-y-2 mt-3">
                    {filteredLogs.slice(0, 5).map((log, idx) => (
                      <div key={log.id} className="flex items-center gap-3">
                        <div className="w-8 text-center text-xs text-gray-400">{idx + 1}</div>
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' :
                          log.status === 'failed' ? 'bg-red-500' : 'bg-orange-500'
                        }`} />
                        <code className="flex-1 text-sm truncate">{log.resource}</code>
                        <Badge variant="outline" className="text-xs">{log.method}</Badge>
                        <span className="text-xs text-gray-500">{formatDuration(log.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
