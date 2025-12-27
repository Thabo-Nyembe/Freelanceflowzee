'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Activity,
  User,
  Settings,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Search,
  Calendar,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  Server,
  Key,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Info,
  Zap,
  BarChart3,
  PieChart,
  Users,
  Building,
  ChevronRight,
  Copy,
  ExternalLink,
  Terminal,
  Code,
  Layers,
  Archive,
  FileWarning,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Sliders,
  Webhook,
  Upload,
  Mail
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS - Datadog/Splunk Level Audit Logging
// ============================================================================

type LogSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'
type LogType = 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security' | 'admin' | 'api'
type LogStatus = 'success' | 'failed' | 'blocked' | 'pending' | 'timeout'
type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted'
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
type ComplianceFramework = 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001'
type RetentionPeriod = '7d' | '30d' | '90d' | '1y' | '7y'

interface AuditLog {
  id: string
  timestamp: string
  log_type: LogType
  severity: LogSeverity
  status: LogStatus
  action: string
  description: string
  user_id: string | null
  user_email: string | null
  user_name: string | null
  user_role: string | null
  ip_address: string
  user_agent: string
  device_type: 'desktop' | 'mobile' | 'tablet' | 'api'
  location: string
  country: string
  city: string
  resource_type: string
  resource_id: string
  resource_name: string
  request_id: string
  session_id: string | null
  duration_ms: number
  metadata: Record<string, unknown>
  tags: string[]
  is_anomaly: boolean
  risk_score: number
}

interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  severity: AlertSeverity
  is_active: boolean
  threshold: number
  window_minutes: number
  notification_channels: string[]
  last_triggered_at: string | null
  trigger_count_24h: number
  created_at: string
  updated_at: string
}

interface Alert {
  id: string
  rule_id: string
  rule_name: string
  severity: AlertSeverity
  status: AlertStatus
  message: string
  triggered_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  acknowledged_by: string | null
  resolved_by: string | null
  affected_resources: number
  sample_logs: string[]
}

interface ComplianceReport {
  id: string
  framework: ComplianceFramework
  period: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending'
  score: number
  total_controls: number
  passed_controls: number
  failed_controls: number
  findings: number
  generated_at: string
}

interface UserSession {
  id: string
  user_id: string
  user_email: string
  user_name: string
  started_at: string
  last_activity_at: string
  ip_address: string
  location: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  is_active: boolean
  actions_count: number
  risk_level: 'low' | 'medium' | 'high'
}

interface GeoDistribution {
  country: string
  country_code: string
  count: number
  percentage: number
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const mockLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2024-01-15T10:30:45Z',
    log_type: 'authentication',
    severity: 'info',
    status: 'success',
    action: 'user.login',
    description: 'User successfully authenticated via SSO',
    user_id: 'u-001',
    user_email: 'sarah.chen@company.com',
    user_name: 'Sarah Chen',
    user_role: 'Admin',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    device_type: 'desktop',
    location: 'San Francisco, CA',
    country: 'United States',
    city: 'San Francisco',
    resource_type: 'session',
    resource_id: 'sess-12345',
    resource_name: 'Web Session',
    request_id: 'req-abc123',
    session_id: 'sess-12345',
    duration_ms: 245,
    metadata: { auth_method: 'sso', provider: 'okta' },
    tags: ['sso', 'admin'],
    is_anomaly: false,
    risk_score: 5
  },
  {
    id: 'log-002',
    timestamp: '2024-01-15T10:28:30Z',
    log_type: 'security',
    severity: 'warning',
    status: 'blocked',
    action: 'security.rate_limit_exceeded',
    description: 'Rate limit exceeded for API endpoint /api/v1/users',
    user_id: null,
    user_email: null,
    user_name: null,
    user_role: null,
    ip_address: '45.33.32.156',
    user_agent: 'python-requests/2.28.0',
    device_type: 'api',
    location: 'Unknown',
    country: 'Russia',
    city: 'Moscow',
    resource_type: 'api_endpoint',
    resource_id: '/api/v1/users',
    resource_name: 'Users API',
    request_id: 'req-def456',
    session_id: null,
    duration_ms: 12,
    metadata: { requests_count: 1500, limit: 100, window: '1m' },
    tags: ['rate-limit', 'api', 'suspicious'],
    is_anomaly: true,
    risk_score: 75
  },
  {
    id: 'log-003',
    timestamp: '2024-01-15T10:25:15Z',
    log_type: 'data_modification',
    severity: 'info',
    status: 'success',
    action: 'record.update',
    description: 'Customer record updated',
    user_id: 'u-002',
    user_email: 'mike.wilson@company.com',
    user_name: 'Mike Wilson',
    user_role: 'Manager',
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    device_type: 'desktop',
    location: 'New York, NY',
    country: 'United States',
    city: 'New York',
    resource_type: 'customer',
    resource_id: 'cust-789',
    resource_name: 'Acme Corp',
    request_id: 'req-ghi789',
    session_id: 'sess-67890',
    duration_ms: 156,
    metadata: { fields_changed: ['email', 'phone'], old_email: 'old@acme.com', new_email: 'new@acme.com' },
    tags: ['customer', 'pii'],
    is_anomaly: false,
    risk_score: 20
  },
  {
    id: 'log-004',
    timestamp: '2024-01-15T10:22:00Z',
    log_type: 'authentication',
    severity: 'error',
    status: 'failed',
    action: 'user.login_failed',
    description: 'Failed login attempt - invalid password',
    user_id: null,
    user_email: 'admin@company.com',
    user_name: null,
    user_role: null,
    ip_address: '203.0.113.50',
    user_agent: 'Mozilla/5.0 (Linux; Android 11)',
    device_type: 'mobile',
    location: 'Beijing, China',
    country: 'China',
    city: 'Beijing',
    resource_type: 'authentication',
    resource_id: 'auth-001',
    resource_name: 'Login Form',
    request_id: 'req-jkl012',
    session_id: null,
    duration_ms: 89,
    metadata: { attempt_number: 3, lockout_threshold: 5 },
    tags: ['failed-login', 'suspicious'],
    is_anomaly: true,
    risk_score: 60
  },
  {
    id: 'log-005',
    timestamp: '2024-01-15T10:20:00Z',
    log_type: 'admin',
    severity: 'warning',
    status: 'success',
    action: 'user.permissions_changed',
    description: 'User role elevated to Admin',
    user_id: 'u-001',
    user_email: 'sarah.chen@company.com',
    user_name: 'Sarah Chen',
    user_role: 'Admin',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    device_type: 'desktop',
    location: 'San Francisco, CA',
    country: 'United States',
    city: 'San Francisco',
    resource_type: 'user',
    resource_id: 'u-003',
    resource_name: 'Emma Davis',
    request_id: 'req-mno345',
    session_id: 'sess-12345',
    duration_ms: 234,
    metadata: { old_role: 'User', new_role: 'Admin', reason: 'Promotion' },
    tags: ['privilege-escalation', 'admin'],
    is_anomaly: false,
    risk_score: 45
  },
  {
    id: 'log-006',
    timestamp: '2024-01-15T10:15:00Z',
    log_type: 'security',
    severity: 'critical',
    status: 'blocked',
    action: 'security.sql_injection_attempt',
    description: 'SQL injection attempt detected and blocked',
    user_id: null,
    user_email: null,
    user_name: null,
    user_role: null,
    ip_address: '198.51.100.23',
    user_agent: 'sqlmap/1.7',
    device_type: 'api',
    location: 'Unknown',
    country: 'Netherlands',
    city: 'Amsterdam',
    resource_type: 'api_endpoint',
    resource_id: '/api/v1/search',
    resource_name: 'Search API',
    request_id: 'req-pqr678',
    session_id: null,
    duration_ms: 5,
    metadata: { payload: "'; DROP TABLE users; --", blocked_by: 'WAF' },
    tags: ['attack', 'sql-injection', 'blocked'],
    is_anomaly: true,
    risk_score: 95
  },
  {
    id: 'log-007',
    timestamp: '2024-01-15T10:10:00Z',
    log_type: 'data_access',
    severity: 'info',
    status: 'success',
    action: 'data.export',
    description: 'Customer data exported to CSV',
    user_id: 'u-002',
    user_email: 'mike.wilson@company.com',
    user_name: 'Mike Wilson',
    user_role: 'Manager',
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    device_type: 'desktop',
    location: 'New York, NY',
    country: 'United States',
    city: 'New York',
    resource_type: 'export',
    resource_id: 'exp-001',
    resource_name: 'Customer Export',
    request_id: 'req-stu901',
    session_id: 'sess-67890',
    duration_ms: 4567,
    metadata: { records_count: 1500, format: 'csv', includes_pii: true },
    tags: ['export', 'pii', 'bulk'],
    is_anomaly: false,
    risk_score: 35
  },
  {
    id: 'log-008',
    timestamp: '2024-01-15T10:05:00Z',
    log_type: 'system',
    severity: 'info',
    status: 'success',
    action: 'system.backup_completed',
    description: 'Scheduled database backup completed successfully',
    user_id: null,
    user_email: null,
    user_name: null,
    user_role: null,
    ip_address: '10.0.0.50',
    user_agent: 'BackupService/2.0',
    device_type: 'api',
    location: 'AWS us-west-2',
    country: 'United States',
    city: 'Oregon',
    resource_type: 'database',
    resource_id: 'db-prod-001',
    resource_name: 'Production Database',
    request_id: 'req-vwx234',
    session_id: null,
    duration_ms: 125000,
    metadata: { backup_size: '45.2GB', tables_count: 156, compressed: true },
    tags: ['backup', 'scheduled', 'database'],
    is_anomaly: false,
    risk_score: 0
  }
]

const mockAlertRules: AlertRule[] = [
  {
    id: 'rule-001',
    name: 'Failed Login Threshold',
    description: 'Alert when failed login attempts exceed threshold',
    condition: 'count(action:user.login_failed) > threshold',
    severity: 'high',
    is_active: true,
    threshold: 5,
    window_minutes: 15,
    notification_channels: ['slack', 'email'],
    last_triggered_at: '2024-01-15T09:45:00Z',
    trigger_count_24h: 3,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-10T14:00:00Z'
  },
  {
    id: 'rule-002',
    name: 'SQL Injection Detection',
    description: 'Alert on any SQL injection attempt',
    condition: 'action:security.sql_injection_attempt',
    severity: 'critical',
    is_active: true,
    threshold: 1,
    window_minutes: 1,
    notification_channels: ['pagerduty', 'slack', 'email'],
    last_triggered_at: '2024-01-15T10:15:00Z',
    trigger_count_24h: 1,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-12-15T10:00:00Z'
  },
  {
    id: 'rule-003',
    name: 'Bulk Data Export',
    description: 'Alert when large data exports occur',
    condition: 'action:data.export AND metadata.records_count > threshold',
    severity: 'medium',
    is_active: true,
    threshold: 1000,
    window_minutes: 60,
    notification_channels: ['slack'],
    last_triggered_at: '2024-01-15T10:10:00Z',
    trigger_count_24h: 2,
    created_at: '2023-08-15T00:00:00Z',
    updated_at: '2024-01-05T09:00:00Z'
  },
  {
    id: 'rule-004',
    name: 'Privilege Escalation',
    description: 'Alert on any role/permission changes',
    condition: 'action:user.permissions_changed AND metadata.new_role:Admin',
    severity: 'high',
    is_active: true,
    threshold: 1,
    window_minutes: 1,
    notification_channels: ['slack', 'email'],
    last_triggered_at: '2024-01-15T10:20:00Z',
    trigger_count_24h: 1,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-11-20T16:00:00Z'
  },
  {
    id: 'rule-005',
    name: 'Rate Limit Exceeded',
    description: 'Alert when rate limiting is triggered',
    condition: 'action:security.rate_limit_exceeded',
    severity: 'medium',
    is_active: true,
    threshold: 1,
    window_minutes: 5,
    notification_channels: ['slack'],
    last_triggered_at: '2024-01-15T10:28:30Z',
    trigger_count_24h: 5,
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2024-01-08T11:00:00Z'
  }
]

const mockAlerts: Alert[] = [
  { id: 'alert-001', rule_id: 'rule-002', rule_name: 'SQL Injection Detection', severity: 'critical', status: 'active', message: 'SQL injection attempt detected from 198.51.100.23', triggered_at: '2024-01-15T10:15:00Z', acknowledged_at: null, resolved_at: null, acknowledged_by: null, resolved_by: null, affected_resources: 1, sample_logs: ['log-006'] },
  { id: 'alert-002', rule_id: 'rule-005', rule_name: 'Rate Limit Exceeded', severity: 'medium', status: 'acknowledged', message: 'Rate limit exceeded for /api/v1/users from 45.33.32.156', triggered_at: '2024-01-15T10:28:30Z', acknowledged_at: '2024-01-15T10:30:00Z', resolved_at: null, acknowledged_by: 'Sarah Chen', resolved_by: null, affected_resources: 1, sample_logs: ['log-002'] },
  { id: 'alert-003', rule_id: 'rule-001', rule_name: 'Failed Login Threshold', severity: 'high', status: 'resolved', message: '5 failed login attempts for admin@company.com', triggered_at: '2024-01-15T09:45:00Z', acknowledged_at: '2024-01-15T09:50:00Z', resolved_at: '2024-01-15T10:00:00Z', acknowledged_by: 'Mike Wilson', resolved_by: 'Mike Wilson', affected_resources: 1, sample_logs: ['log-004'] }
]

const mockComplianceReports: ComplianceReport[] = [
  { id: 'comp-001', framework: 'SOC2', period: '2024-Q1', status: 'compliant', score: 94, total_controls: 116, passed_controls: 109, failed_controls: 7, findings: 3, generated_at: '2024-01-15T00:00:00Z' },
  { id: 'comp-002', framework: 'GDPR', period: '2024-Q1', status: 'compliant', score: 98, total_controls: 72, passed_controls: 71, failed_controls: 1, findings: 1, generated_at: '2024-01-15T00:00:00Z' },
  { id: 'comp-003', framework: 'HIPAA', period: '2024-Q1', status: 'partial', score: 87, total_controls: 89, passed_controls: 77, failed_controls: 12, findings: 8, generated_at: '2024-01-15T00:00:00Z' },
  { id: 'comp-004', framework: 'PCI-DSS', period: '2024-Q1', status: 'compliant', score: 96, total_controls: 256, passed_controls: 246, failed_controls: 10, findings: 4, generated_at: '2024-01-15T00:00:00Z' },
  { id: 'comp-005', framework: 'ISO27001', period: '2024-Q1', status: 'compliant', score: 92, total_controls: 114, passed_controls: 105, failed_controls: 9, findings: 5, generated_at: '2024-01-15T00:00:00Z' }
]

const mockSessions: UserSession[] = [
  { id: 'sess-001', user_id: 'u-001', user_email: 'sarah.chen@company.com', user_name: 'Sarah Chen', started_at: '2024-01-15T08:00:00Z', last_activity_at: '2024-01-15T10:30:45Z', ip_address: '192.168.1.100', location: 'San Francisco, CA', device_type: 'desktop', browser: 'Chrome 120', os: 'macOS 14.2', is_active: true, actions_count: 156, risk_level: 'low' },
  { id: 'sess-002', user_id: 'u-002', user_email: 'mike.wilson@company.com', user_name: 'Mike Wilson', started_at: '2024-01-15T09:15:00Z', last_activity_at: '2024-01-15T10:25:15Z', ip_address: '192.168.1.105', location: 'New York, NY', device_type: 'desktop', browser: 'Firefox 121', os: 'Windows 11', is_active: true, actions_count: 89, risk_level: 'low' },
  { id: 'sess-003', user_id: 'u-003', user_email: 'emma.davis@company.com', user_name: 'Emma Davis', started_at: '2024-01-15T07:30:00Z', last_activity_at: '2024-01-15T09:45:00Z', ip_address: '192.168.1.110', location: 'Austin, TX', device_type: 'mobile', browser: 'Safari 17', os: 'iOS 17.2', is_active: false, actions_count: 45, risk_level: 'low' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSeverityColor = (severity: LogSeverity | AlertSeverity): string => {
  switch (severity) {
    case 'debug': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'info': case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'warning': case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'error': case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getStatusColor = (status: LogStatus | AlertStatus): string => {
  switch (status) {
    case 'success': case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'failed': case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'blocked': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'pending': case 'acknowledged': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'timeout': case 'muted': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getComplianceColor = (status: string): string => {
  switch (status) {
    case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'non_compliant': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getLogTypeIcon = (type: LogType) => {
  switch (type) {
    case 'authentication': return <LogIn className="w-4 h-4" />
    case 'authorization': return <Key className="w-4 h-4" />
    case 'data_access': return <Eye className="w-4 h-4" />
    case 'data_modification': return <Edit className="w-4 h-4" />
    case 'system': return <Server className="w-4 h-4" />
    case 'security': return <Shield className="w-4 h-4" />
    case 'admin': return <Settings className="w-4 h-4" />
    case 'api': return <Code className="w-4 h-4" />
    default: return <Activity className="w-4 h-4" />
  }
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'desktop': return <Monitor className="w-4 h-4" />
    case 'mobile': return <Smartphone className="w-4 h-4" />
    case 'tablet': return <Monitor className="w-4 h-4" />
    case 'api': return <Terminal className="w-4 h-4" />
    default: return <Monitor className="w-4 h-4" />
  }
}

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuditLogsClient() {
  const [activeTab, setActiveTab] = useState('events')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<LogType | 'all'>('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [settingsTab, setSettingsTab] = useState('general')

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        log.ip_address.includes(searchQuery)
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
      const matchesType = typeFilter === 'all' || log.log_type === typeFilter
      return matchesSearch && matchesSeverity && matchesType
    })
  }, [searchQuery, severityFilter, typeFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const total = mockLogs.length
    const critical = mockLogs.filter(l => l.severity === 'critical').length
    const warnings = mockLogs.filter(l => l.severity === 'warning').length
    const errors = mockLogs.filter(l => l.severity === 'error').length
    const anomalies = mockLogs.filter(l => l.is_anomaly).length
    const blocked = mockLogs.filter(l => l.status === 'blocked').length
    const activeAlerts = mockAlerts.filter(a => a.status === 'active').length
    const avgRisk = mockLogs.reduce((acc, l) => acc + l.risk_score, 0) / total

    return { total, critical, warnings, errors, anomalies, blocked, activeAlerts, avgRisk }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
              <p className="text-gray-500 dark:text-gray-400">Datadog level security monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isLiveMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={isLiveMode ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isLiveMode ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isLiveMode ? 'Live' : 'Paused'}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Events', value: stats.total.toLocaleString(), icon: Activity, color: 'from-indigo-500 to-purple-500', change: 18.2 },
            { label: 'Critical', value: stats.critical.toString(), icon: AlertTriangle, color: 'from-red-500 to-rose-500', change: -24.7 },
            { label: 'Warnings', value: stats.warnings.toString(), icon: AlertCircle, color: 'from-yellow-500 to-orange-500', change: 5.3 },
            { label: 'Errors', value: stats.errors.toString(), icon: XCircle, color: 'from-orange-500 to-red-500', change: -12.4 },
            { label: 'Anomalies', value: stats.anomalies.toString(), icon: Zap, color: 'from-purple-500 to-pink-500', change: 8.1 },
            { label: 'Blocked', value: stats.blocked.toString(), icon: Shield, color: 'from-green-500 to-emerald-500', change: 15.6 },
            { label: 'Active Alerts', value: stats.activeAlerts.toString(), icon: Bell, color: 'from-blue-500 to-cyan-500', change: 0 },
            { label: 'Avg Risk', value: `${stats.avgRisk.toFixed(0)}%`, icon: TrendingUp, color: 'from-teal-500 to-cyan-500', change: -3.2 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
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
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {stats.activeAlerts > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{stats.activeAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6 space-y-6">
            {/* Events Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Event Stream</h2>
                    <p className="text-white/80">Real-time security monitoring and audit trail</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Events</p>
                    <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Critical</p>
                    <p className="text-2xl font-bold">{stats.critical}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Anomalies</p>
                    <p className="text-2xl font-bold">{stats.anomalies}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Blocked</p>
                    <p className="text-2xl font-bold">{stats.blocked}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Search, label: 'Search Logs', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' },
                { icon: Bell, label: 'New Alert', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
                { icon: Download, label: 'Export', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
                { icon: Filter, label: 'Save Filter', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                { icon: ShieldCheck, label: 'Compliance', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
                { icon: Archive, label: 'Archive', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
                { icon: Webhook, label: 'Integrations', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Event Stream</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'critical', 'error', 'warning', 'info'] as const).map(sev => (
                        <Button
                          key={sev}
                          variant={severityFilter === sev ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setSeverityFilter(sev)}
                          className={severityFilter === sev ? 'bg-indigo-600' : ''}
                        >
                          {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${log.is_anomaly ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          log.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          log.severity === 'error' ? 'bg-orange-100 text-orange-600' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getLogTypeIcon(log.log_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {log.action}
                            </span>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                            {log.is_anomaly && (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                <Zap className="w-3 h-3 mr-1" />
                                Anomaly
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            {log.user_email && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.user_email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {log.ip_address}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {log.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Risk: {log.risk_score}%
                          </p>
                          <p className="text-xs text-gray-500">{formatDuration(log.duration_ms)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6 space-y-6">
            {/* Search Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Log Query</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use structured queries to search audit logs</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Saved Queries
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>Use query language to search logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="severity:critical AND log_type:security"
                      className="flex-1 font-mono"
                    />
                    <Button className="bg-indigo-600">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">severity:critical</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">log_type:security</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">is_anomaly:true</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">status:blocked</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">risk_score:&gt;50</Badge>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Saved Searches</h4>
                    <div className="space-y-2">
                      {['Failed logins last 24h', 'High risk events', 'Data exports with PII', 'Security incidents'].map((search, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-700 rounded cursor-pointer">
                          <span className="text-sm">{search}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6 space-y-6">
            {/* Alerts Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bell className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Alert Management</h2>
                    <p className="text-white/80">Configure and manage security alerts</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Active</p>
                    <p className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'active').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Acknowledged</p>
                    <p className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'acknowledged').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Resolved</p>
                    <p className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'resolved').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Rules</p>
                    <p className="text-2xl font-bold">{mockAlertRules.length}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
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
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{alert.rule_name}</span>
                                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                                <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Triggered {new Date(alert.triggered_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Alert Rules</CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Rule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mockAlertRules.map(rule => (
                        <div key={rule.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.name}</span>
                              <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                              <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {rule.trigger_count_24h} triggers/24h
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{rule.description}</p>
                          <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
                            {rule.condition}
                          </code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Active</span>
                        <span className="font-bold text-red-600">{mockAlerts.filter(a => a.status === 'active').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Acknowledged</span>
                        <span className="font-bold text-yellow-600">{mockAlerts.filter(a => a.status === 'acknowledged').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Resolved (24h)</span>
                        <span className="font-bold text-green-600">{mockAlerts.filter(a => a.status === 'resolved').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Slack #security-alerts', 'PagerDuty On-Call', 'Email security@company.com'].map((channel, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 border rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{channel}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6 space-y-6">
            {/* Compliance Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Compliance Dashboard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SOC2, GDPR, HIPAA, PCI-DSS, ISO27001 compliance status</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockComplianceReports.map(report => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.framework}</CardTitle>
                      <Badge className={getComplianceColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{report.period}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className={`text-4xl font-bold ${
                          report.score >= 90 ? 'text-green-600' :
                          report.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {report.score}%
                        </span>
                        <p className="text-sm text-gray-500">Compliance Score</p>
                      </div>
                      <Progress value={report.score} className="h-2" />
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{report.passed_controls}</p>
                          <p className="text-xs text-gray-500">Passed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{report.failed_controls}</p>
                          <p className="text-xs text-gray-500">Failed</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Security Analytics</h2>
                    <p className="text-white/80">Insights and trends from your audit logs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Last 7 Days
                  </button>
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-white/90 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export Report
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'authentication', count: 45, color: 'bg-blue-500' },
                      { type: 'data_modification', count: 32, color: 'bg-green-500' },
                      { type: 'security', count: 18, color: 'bg-red-500' },
                      { type: 'system', count: 12, color: 'bg-purple-500' },
                      { type: 'admin', count: 8, color: 'bg-orange-500' }
                    ].map(item => (
                      <div key={item.type} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm capitalize">{item.type.replace('_', ' ')}</span>
                        <span className="font-semibold">{item.count}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { country: 'United States', count: 156, pct: 65 },
                      { country: 'Germany', count: 34, pct: 14 },
                      { country: 'United Kingdom', count: 28, pct: 12 },
                      { country: 'Japan', count: 15, pct: 6 },
                      { country: 'Other', count: 7, pct: 3 }
                    ].map(item => (
                      <div key={item.country} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.country}</span>
                          <span className="font-semibold">{item.count} ({item.pct}%)</span>
                        </div>
                        <Progress value={item.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSessions.map(session => (
                      <div key={session.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{session.user_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{session.user_name}</p>
                          <p className="text-xs text-gray-500">{session.location} • {session.browser}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={session.is_active ? 'default' : 'secondary'}>
                            {session.is_active ? 'Active' : 'Idle'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{session.actions_count} actions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <span>Critical Events</span>
                      </div>
                      <span className="font-bold text-green-600">-24.7%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <span>Anomaly Detection</span>
                      </div>
                      <span className="font-bold text-red-600">+8.1%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span>Blocked Attacks</span>
                      </div>
                      <span className="font-bold text-green-600">+15.6%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'retention', label: 'Retention', icon: Database },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Log Sources</CardTitle>
                        <CardDescription>Connected log sources and event rates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Application Server', status: 'connected', events: '12.4K/hr' },
                            { name: 'Database', status: 'connected', events: '8.2K/hr' },
                            { name: 'Load Balancer', status: 'connected', events: '45.6K/hr' },
                            { name: 'Firewall', status: 'connected', events: '23.1K/hr' },
                            { name: 'CDN', status: 'connected', events: '67.2K/hr' },
                          ].map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="font-medium">{source.name}</span>
                              </div>
                              <span className="text-sm text-gray-500">{source.events}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Anomaly Detection</CardTitle>
                        <CardDescription>ML-powered anomaly detection settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Anomaly Detection</p>
                            <p className="text-sm text-gray-500">Uses ML to detect unusual patterns</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="sensitivity">Sensitivity Level</Label>
                          <select id="sensitivity" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="learningPeriod">Learning Period</Label>
                          <select id="learningPeriod" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>7 days</option>
                            <option>14 days</option>
                            <option>30 days</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'retention' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Retention Policy</CardTitle>
                        <CardDescription>Configure how long logs are retained</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { type: 'Security Logs', retention: '7 years', required: true },
                            { type: 'Authentication Logs', retention: '1 year', required: true },
                            { type: 'Audit Logs', retention: '2 years', required: true },
                            { type: 'System Logs', retention: '90 days', required: false },
                            { type: 'Debug Logs', retention: '7 days', required: false }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{item.type}</p>
                                {item.required && <span className="text-xs text-gray-500">Compliance required</span>}
                              </div>
                              <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                <option>{item.retention}</option>
                                <option>30 days</option>
                                <option>90 days</option>
                                <option>1 year</option>
                                <option>7 years</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Storage Settings</CardTitle>
                        <CardDescription>Configure log storage options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Compression</p>
                            <p className="text-sm text-gray-500">Compress archived logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Encryption at Rest</p>
                            <p className="text-sm text-gray-500">Encrypt stored logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Notifications</CardTitle>
                        <CardDescription>Configure notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Critical Events', desc: 'Immediate alerts for critical events', enabled: true },
                          { name: 'Failed Logins', desc: 'Alert on failed login attempts', enabled: true },
                          { name: 'Anomaly Detection', desc: 'Alert when anomalies are detected', enabled: true },
                          { name: 'Data Exports', desc: 'Notify on bulk data exports', enabled: false },
                          { name: 'Daily Summary', desc: 'Daily audit log summary', enabled: true },
                        ].map((notification) => (
                          <div key={notification.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notification.name}</p>
                              <p className="text-sm text-gray-500">{notification.desc}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Where to send notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="emailNotify">Email Addresses</Label>
                          <Input id="emailNotify" type="text" className="mt-1" defaultValue="security@company.com" />
                        </div>
                        <div>
                          <Label htmlFor="slackWebhook">Slack Webhook</Label>
                          <Input id="slackWebhook" type="url" className="mt-1" placeholder="https://hooks.slack.com/..." />
                        </div>
                        <div>
                          <Label htmlFor="pagerduty">PagerDuty Key</Label>
                          <Input id="pagerduty" type="text" className="mt-1" placeholder="Integration key" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>SIEM Integration</CardTitle>
                        <CardDescription>Connect to your SIEM platform</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Splunk', desc: 'Forward logs to Splunk', status: 'connected', icon: '📊' },
                          { name: 'Datadog', desc: 'Send to Datadog', status: 'disconnected', icon: '🐕' },
                          { name: 'Elastic', desc: 'Elasticsearch integration', status: 'disconnected', icon: '🔍' },
                          { name: 'Sumo Logic', desc: 'Cloud SIEM', status: 'disconnected', icon: '☁️' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                              {integration.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Storage</CardTitle>
                        <CardDescription>Archive logs to cloud storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">AWS S3</p>
                            <p className="text-sm text-gray-500">Auto-archive to S3</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="s3Bucket">S3 Bucket</Label>
                          <Input id="s3Bucket" type="text" className="mt-1" defaultValue="audit-logs-archive" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access audit logs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Required</p>
                            <p className="text-sm text-gray-500">Require SSO for access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Restrict access by IP</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Log Access</p>
                            <p className="text-sm text-gray-500">Log who views audit logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Protection</CardTitle>
                        <CardDescription>Configure data security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">PII Masking</p>
                            <p className="text-sm text-gray-500">Mask sensitive data in logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Encryption in Transit</p>
                            <p className="text-sm text-gray-500">TLS for all transfers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Settings</CardTitle>
                        <CardDescription>Configure log export options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export All Logs</p>
                            <p className="text-sm text-gray-500">Download complete audit trail</p>
                          </div>
                          <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor="exportFormat">Default Format</Label>
                          <select id="exportFormat" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>JSON</option>
                            <option>CSV</option>
                            <option>Parquet</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear Debug Logs</p>
                            <p className="text-sm text-gray-500">Remove all debug-level logs</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset Configuration</p>
                            <p className="text-sm text-gray-500">Reset all settings to default</p>
                          </div>
                          <Button variant="destructive">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
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

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5" />
                Event Details
              </DialogTitle>
              <DialogDescription>
                {selectedLog?.id} • {selectedLog?.timestamp && new Date(selectedLog.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-120px)]">
              {selectedLog && (
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getSeverityColor(selectedLog.severity)}>{selectedLog.severity}</Badge>
                    <Badge className={getStatusColor(selectedLog.status)}>{selectedLog.status}</Badge>
                    <Badge variant="outline">{selectedLog.log_type}</Badge>
                    {selectedLog.is_anomaly && (
                      <Badge className="bg-purple-100 text-purple-800">Anomaly</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{selectedLog.action}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedLog.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">User</p>
                      <p className="font-medium">{selectedLog.user_email || 'System'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">IP Address</p>
                      <p className="font-medium font-mono">{selectedLog.ip_address}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-medium">{selectedLog.city}, {selectedLog.country}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="font-medium">{formatDuration(selectedLog.duration_ms)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Resource</p>
                      <p className="font-medium">{selectedLog.resource_name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                      <p className={`font-medium ${selectedLog.risk_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedLog.risk_score}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Metadata</p>
                    <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy ID
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Related Events
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
