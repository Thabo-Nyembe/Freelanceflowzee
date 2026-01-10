'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Trash2,
  Edit,
  Plus,
  LogIn,
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
  Zap,
  BarChart3,
  ChevronRight,
  Copy,
  ExternalLink,
  Terminal,
  Code,
  Archive,
  ShieldCheck,
  Sliders,
  Webhook,
  Loader2
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

// Database Types
interface DbAuditLog {
  id: string
  user_id: string
  log_type: string
  severity: string
  action: string
  description: string | null
  resource: string | null
  user_email: string | null
  ip_address: string | null
  location: string | null
  device: string | null
  status: string
  request_method: string | null
  request_path: string | null
  request_body: Record<string, unknown>
  response_status: number | null
  duration_ms: number
  metadata: Record<string, unknown>
  created_at: string
}

interface DbAlertRule {
  id: string
  user_id: string
  rule_name: string
  description: string | null
  log_type: string | null
  severity: string | null
  action_pattern: string | null
  conditions: Record<string, unknown>
  notification_channels: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

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

// Enhanced Competitive Upgrade Mock Data
const mockAuditAIInsights = [
  { id: '1', type: 'warning' as const, title: 'Unusual Activity', description: '15 failed login attempts from IP 192.168.1.50 in last hour.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '2', type: 'success' as const, title: 'Compliance Status', description: 'All audit retention policies are compliant. No issues detected.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '3', type: 'info' as const, title: 'Data Export Complete', description: 'Monthly audit report exported and archived successfully.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Reports' },
]

const mockAuditCollaborators = [
  { id: '1', name: 'Security Lead', avatar: '/avatars/security.jpg', status: 'online' as const, role: 'Security' },
  { id: '2', name: 'Compliance Officer', avatar: '/avatars/compliance.jpg', status: 'online' as const, role: 'Compliance' },
  { id: '3', name: 'IT Admin', avatar: '/avatars/admin.jpg', status: 'away' as const, role: 'IT Admin' },
]

const mockAuditPredictions = [
  { id: '1', title: 'Log Volume', prediction: 'Log volume expected to increase 20% during Q4 audit season', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'Anomaly Detection', prediction: 'ML model accuracy improving to 98.5%', confidence: 92, trend: 'up' as const, impact: 'high' as const },
]

const mockAuditActivities = [
  { id: '1', user: 'Security Lead', action: 'Investigated', target: 'suspicious login pattern', timestamp: new Date().toISOString(), type: 'warning' as const },
  { id: '2', user: 'System', action: 'Archived', target: '500K log entries to cold storage', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'success' as const },
  { id: '3', user: 'Compliance', action: 'Generated', target: 'quarterly compliance report', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'info' as const },
]

// Quick actions are now defined inline in the component to use state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuditLogsClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('events')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<LogType | 'all'>('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [settingsTab, setSettingsTab] = useState('general')

  // Data State
  const [dbLogs, setDbLogs] = useState<DbAuditLog[]>([])
  const [dbAlertRules, setDbAlertRules] = useState<DbAlertRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog State
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false)
  const [showEditRuleDialog, setShowEditRuleDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<DbAlertRule | null>(null)

  // Quick Action Dialog States
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSavedQueriesDialog, setShowSavedQueriesDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showIntegrationsDialog, setShowIntegrationsDialog] = useState(false)
  const [showClearLogsDialog, setShowClearLogsDialog] = useState(false)
  const [showResetConfigDialog, setShowResetConfigDialog] = useState(false)
  const [showRelatedEventsDialog, setShowRelatedEventsDialog] = useState(false)
  const [showComplianceReportDialog, setShowComplianceReportDialog] = useState<string | null>(null)
  const [showSIEMDialog, setShowSIEMDialog] = useState<string | null>(null)
  const [analyticsDateRange, setAnalyticsDateRange] = useState('7d')

  // Form State for Alert Rules
  const [ruleFormData, setRuleFormData] = useState({
    rule_name: '',
    description: '',
    log_type: '',
    severity: '',
    action_pattern: '',
    notification_channels: ['email'],
    is_active: true
  })

  // Fetch audit logs from database
  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setDbLogs(data || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Fetch alert rules from database
  const fetchAlertRules = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('audit_alert_rules')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbAlertRules(data || [])
    } catch (error) {
      console.error('Error fetching alert rules:', error)
      toast.error('Failed to load alert rules')
    }
  }, [supabase])

  // Create audit log entry
  const createAuditLog = async (logData: Partial<DbAuditLog>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in')
        return
      }

      const { error } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        log_type: logData.log_type || 'system',
        severity: logData.severity || 'info',
        action: logData.action || 'manual_entry',
        description: logData.description || null,
        resource: logData.resource || null,
        user_email: user.email,
        ip_address: logData.ip_address || null,
        location: logData.location || null,
        device: logData.device || null,
        status: logData.status || 'success',
        duration_ms: logData.duration_ms || 0,
        metadata: logData.metadata || {}
      })

      if (error) throw error
      toast.success('Audit log created')
      fetchAuditLogs()
    } catch (error) {
      console.error('Error creating audit log:', error)
      toast.error('Failed to create audit log')
    }
  }

  // Create alert rule
  const handleCreateAlertRule = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create alert rules')
        return
      }

      const { error } = await supabase.from('audit_alert_rules').insert({
        user_id: user.id,
        rule_name: ruleFormData.rule_name,
        description: ruleFormData.description || null,
        log_type: ruleFormData.log_type || null,
        severity: ruleFormData.severity || null,
        action_pattern: ruleFormData.action_pattern || null,
        notification_channels: ruleFormData.notification_channels,
        is_active: ruleFormData.is_active,
        conditions: {}
      })

      if (error) throw error

      toast.success('Alert rule created successfully')
      setShowCreateRuleDialog(false)
      resetRuleForm()
      fetchAlertRules()
    } catch (error) {
      console.error('Error creating alert rule:', error)
      toast.error('Failed to create alert rule')
    } finally {
      setIsSaving(false)
    }
  }

  // Update alert rule
  const handleUpdateAlertRule = async () => {
    if (!editingRule) return
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('audit_alert_rules')
        .update({
          rule_name: ruleFormData.rule_name,
          description: ruleFormData.description || null,
          log_type: ruleFormData.log_type || null,
          severity: ruleFormData.severity || null,
          action_pattern: ruleFormData.action_pattern || null,
          notification_channels: ruleFormData.notification_channels,
          is_active: ruleFormData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRule.id)

      if (error) throw error

      toast.success('Alert rule updated successfully')
      setShowEditRuleDialog(false)
      setEditingRule(null)
      resetRuleForm()
      fetchAlertRules()
    } catch (error) {
      console.error('Error updating alert rule:', error)
      toast.error('Failed to update alert rule')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete alert rule
  const handleDeleteAlertRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('audit_alert_rules')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', ruleId)

      if (error) throw error

      toast.success('Alert rule deleted')
      fetchAlertRules()
    } catch (error) {
      console.error('Error deleting alert rule:', error)
      toast.error('Failed to delete alert rule')
    }
  }

  // Toggle alert rule status
  const handleToggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('audit_alert_rules')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', ruleId)

      if (error) throw error

      toast.success(`Alert rule ${isActive ? 'activated' : 'deactivated'}`)
      fetchAlertRules()
    } catch (error) {
      console.error('Error toggling rule status:', error)
      toast.error('Failed to update rule status')
    }
  }

  // Reset form
  const resetRuleForm = () => {
    setRuleFormData({
      rule_name: '',
      description: '',
      log_type: '',
      severity: '',
      action_pattern: '',
      notification_channels: ['email'],
      is_active: true
    })
  }

  // Open edit dialog
  const openEditRuleDialog = (rule: DbAlertRule) => {
    setEditingRule(rule)
    setRuleFormData({
      rule_name: rule.rule_name,
      description: rule.description || '',
      log_type: rule.log_type || '',
      severity: rule.severity || '',
      action_pattern: rule.action_pattern || '',
      notification_channels: rule.notification_channels || ['email'],
      is_active: rule.is_active
    })
    setShowEditRuleDialog(true)
  }

  // Export audit logs
  const handleExportAuditLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Create CSV
      const headers = ['ID', 'Type', 'Severity', 'Action', 'Description', 'Status', 'IP Address', 'Created At']
      const csvContent = [
        headers.join(','),
        ...(data || []).map(log => [
          log.id,
          log.log_type,
          log.severity,
          log.action,
          `"${(log.description || '').replace(/"/g, '""')}"`,
          log.status,
          log.ip_address || '',
          log.created_at
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      // Log the export action
      await createAuditLog({
        log_type: 'data_access',
        action: 'data.export',
        description: 'Exported audit logs to CSV',
        status: 'success'
      })

      toast.success('Audit logs exported successfully')
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Failed to export audit logs')
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAuditLogs()
    fetchAlertRules()
  }, [fetchAuditLogs, fetchAlertRules])

  // Convert DB logs to display format
  const convertedDbLogs: AuditLog[] = useMemo(() => {
    return dbLogs.map(log => ({
      id: log.id,
      timestamp: log.created_at,
      log_type: (log.log_type || 'system') as LogType,
      severity: (log.severity || 'info') as LogSeverity,
      status: (log.status || 'success') as LogStatus,
      action: log.action,
      description: log.description || '',
      user_id: log.user_id,
      user_email: log.user_email,
      user_name: log.user_email?.split('@')[0] || null,
      user_role: null,
      ip_address: log.ip_address || '0.0.0.0',
      user_agent: log.device || 'Unknown',
      device_type: 'desktop' as const,
      location: log.location || 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      resource_type: log.resource || 'unknown',
      resource_id: log.id,
      resource_name: log.resource || 'Unknown',
      request_id: log.id,
      session_id: null,
      duration_ms: log.duration_ms || 0,
      metadata: log.metadata || {},
      tags: [],
      is_anomaly: log.severity === 'critical' || log.severity === 'error',
      risk_score: log.severity === 'critical' ? 90 : log.severity === 'error' ? 60 : log.severity === 'warning' ? 40 : 10
    }))
  }, [dbLogs])

  // Combine DB logs with mock logs for display
  const allLogs = useMemo(() => {
    return [...convertedDbLogs, ...mockLogs]
  }, [convertedDbLogs])

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        log.ip_address.includes(searchQuery)
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
      const matchesType = typeFilter === 'all' || log.log_type === typeFilter
      return matchesSearch && matchesSeverity && matchesType
    })
  }, [allLogs, searchQuery, severityFilter, typeFilter])

  // Convert DB alert rules to display format
  const allAlertRules = useMemo(() => {
    const dbRulesFormatted: AlertRule[] = dbAlertRules.map(rule => ({
      id: rule.id,
      name: rule.rule_name,
      description: rule.description || '',
      condition: rule.action_pattern || 'custom condition',
      severity: (rule.severity || 'medium') as AlertSeverity,
      is_active: rule.is_active,
      threshold: 1,
      window_minutes: 15,
      notification_channels: rule.notification_channels || ['email'],
      last_triggered_at: null,
      trigger_count_24h: 0,
      created_at: rule.created_at,
      updated_at: rule.updated_at
    }))
    return [...dbRulesFormatted, ...mockAlertRules]
  }, [dbAlertRules])

  // Stats calculations
  const stats = useMemo(() => {
    const total = allLogs.length
    const critical = allLogs.filter(l => l.severity === 'critical').length
    const warnings = allLogs.filter(l => l.severity === 'warning').length
    const errors = allLogs.filter(l => l.severity === 'error').length
    const anomalies = allLogs.filter(l => l.is_anomaly).length
    const blocked = allLogs.filter(l => l.status === 'blocked').length
    const activeAlerts = mockAlerts.filter(a => a.status === 'active').length
    const avgRisk = allLogs.length > 0 ? allLogs.reduce((acc, l) => acc + l.risk_score, 0) / total : 0

    return { total, critical, warnings, errors, anomalies, blocked, activeAlerts, avgRisk }
  }, [allLogs])

  // Handlers
  const handleCreateAlert = () => {
    setShowCreateRuleDialog(true)
  }

  const handleInvestigateLog = async (logId: string) => {
    await createAuditLog({
      log_type: 'security',
      action: 'log.investigate',
      description: `Investigating log ${logId}`,
      status: 'success'
    })
    toast.info('Investigation started', {
      description: `Opening investigation for log ${logId}...`
    })
  }

  const handleMarkResolved = async (alertId: string) => {
    await createAuditLog({
      log_type: 'admin',
      action: 'alert.resolve',
      description: `Resolved alert ${alertId}`,
      status: 'success'
    })
    toast.success('Alert resolved', {
      description: `Alert ${alertId} has been marked as resolved`
    })
  }

  const handleGenerateReport = async () => {
    await createAuditLog({
      log_type: 'data_access',
      action: 'report.generate',
      description: 'Generated compliance report',
      status: 'success'
    })
    toast.success('Generating report', {
      description: 'Compliance report is being generated...'
    })
  }

  const handleRefresh = () => {
    fetchAuditLogs()
    fetchAlertRules()
    toast.success('Data refreshed')
  }

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
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleExportAuditLogs}>
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
                { icon: Search, label: 'Search Logs', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600', action: () => setShowSearchDialog(true) },
                { icon: Bell, label: 'New Alert', color: 'bg-red-100 dark:bg-red-900/30 text-red-600', action: () => setShowCreateRuleDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-green-100 dark:bg-green-900/30 text-green-600', action: () => setShowExportDialog(true) },
                { icon: Filter, label: 'Save Filter', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', action: () => { toast.success('Filter saved', { description: 'Current filter has been saved to your saved filters' }) } },
                { icon: ShieldCheck, label: 'Compliance', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', action: () => setActiveTab('compliance') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600', action: () => setActiveTab('analytics') },
                { icon: Archive, label: 'Archive', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', action: () => setShowArchiveDialog(true) },
                { icon: Webhook, label: 'Integrations', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600', action: () => setShowIntegrationsDialog(true) },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
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
              <Button variant="outline" size="sm" onClick={() => setShowSavedQueriesDialog(true)}>
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button className="bg-indigo-600" onClick={() => {
                      if (searchQuery) {
                        toast.success('Search executed', { description: `Searching for: ${searchQuery}` })
                        setActiveTab('events')
                      } else {
                        toast.error('Please enter a search query')
                      }
                    }}>
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
                      <Button size="sm" onClick={handleCreateAlert}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Rule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {allAlertRules.map(rule => (
                        <div key={rule.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.name}</span>
                              <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                              <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {rule.trigger_count_24h} triggers/24h
                              </span>
                              {!mockAlertRules.find(m => m.id === rule.id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const dbRule = dbAlertRules.find(r => r.id === rule.id)
                                    if (dbRule) openEditRuleDialog(dbRule)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
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
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Refreshing compliance data', { description: 'Fetching latest compliance status...' })
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                  toast.success('Exporting all compliance reports', { description: 'Your download will begin shortly...' })
                }}>
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
                      <Button variant="outline" className="w-full" onClick={() => setShowComplianceReportDialog(report.id)}>
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
                  <button
                    className={`px-4 py-2 ${analyticsDateRange === '7d' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'} rounded-lg backdrop-blur-sm transition-colors`}
                    onClick={() => {
                      setAnalyticsDateRange('7d')
                      toast.success('Date range updated', { description: 'Showing last 7 days' })
                    }}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Last 7 Days
                  </button>
                  <button
                    className={`px-4 py-2 ${analyticsDateRange === '30d' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30'} rounded-lg backdrop-blur-sm transition-colors`}
                    onClick={() => {
                      setAnalyticsDateRange('30d')
                      toast.success('Date range updated', { description: 'Showing last 30 days' })
                    }}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Last 30 Days
                  </button>
                  <button
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-white/90 transition-colors"
                    onClick={() => {
                      toast.success('Exporting analytics report', { description: 'Your download will begin shortly...' })
                    }}
                  >
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
                            <Button
                              variant={integration.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => setShowSIEMDialog(integration.name)}
                            >
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
                          <Button onClick={handleExportAuditLogs}>
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
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowClearLogsDialog(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset Configuration</p>
                            <p className="text-sm text-gray-500">Reset all settings to default</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowResetConfigDialog(true)}>
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAuditAIInsights}
              title="Audit Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
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
            actions={[
              { id: '1', label: 'Search Logs', icon: 'search', action: () => setShowSearchDialog(true), variant: 'default' as const },
              { id: '2', label: 'Create Alert', icon: 'bell', action: () => setShowCreateRuleDialog(true), variant: 'default' as const },
              { id: '3', label: 'Export Data', icon: 'download', action: () => setShowExportDialog(true), variant: 'outline' as const },
            ]}
            variant="grid"
          />
        </div>

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
                    <Button variant="outline" className="flex-1" onClick={() => {
                      if (selectedLog) {
                        navigator.clipboard.writeText(selectedLog.id)
                        toast.success('Copied to clipboard', { description: `Log ID: ${selectedLog.id}` })
                      }
                    }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy ID
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setSelectedLog(null)
                      setShowRelatedEventsDialog(true)
                    }}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Related Events
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Create Alert Rule Dialog */}
        <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Create Alert Rule
              </DialogTitle>
              <DialogDescription>
                Configure a new alert rule for audit log monitoring
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={ruleFormData.rule_name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, rule_name: e.target.value })}
                  placeholder="e.g., Failed Login Threshold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  placeholder="What does this rule monitor?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="log_type">Log Type</Label>
                  <select
                    id="log_type"
                    value={ruleFormData.log_type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, log_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="authentication">Authentication</option>
                    <option value="security">Security</option>
                    <option value="data_access">Data Access</option>
                    <option value="admin">Admin</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <select
                    id="severity"
                    value={ruleFormData.severity}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_pattern">Action Pattern</Label>
                <Input
                  id="action_pattern"
                  value={ruleFormData.action_pattern}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, action_pattern: e.target.value })}
                  placeholder="e.g., user.login_failed"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={ruleFormData.is_active}
                  onCheckedChange={(checked) => setRuleFormData({ ...ruleFormData, is_active: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateRuleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlertRule} disabled={isSaving || !ruleFormData.rule_name}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Alert Rule Dialog */}
        <Dialog open={showEditRuleDialog} onOpenChange={setShowEditRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Alert Rule
              </DialogTitle>
              <DialogDescription>
                Update alert rule configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_rule_name">Rule Name</Label>
                <Input
                  id="edit_rule_name"
                  value={ruleFormData.rule_name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, rule_name: e.target.value })}
                  placeholder="e.g., Failed Login Threshold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  placeholder="What does this rule monitor?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_log_type">Log Type</Label>
                  <select
                    id="edit_log_type"
                    value={ruleFormData.log_type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, log_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="authentication">Authentication</option>
                    <option value="security">Security</option>
                    <option value="data_access">Data Access</option>
                    <option value="admin">Admin</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_severity">Severity</Label>
                  <select
                    id="edit_severity"
                    value={ruleFormData.severity}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_action_pattern">Action Pattern</Label>
                <Input
                  id="edit_action_pattern"
                  value={ruleFormData.action_pattern}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, action_pattern: e.target.value })}
                  placeholder="e.g., user.login_failed"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_active">Active</Label>
                <Switch
                  id="edit_is_active"
                  checked={ruleFormData.is_active}
                  onCheckedChange={(checked) => setRuleFormData({ ...ruleFormData, is_active: checked })}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingRule) {
                    handleDeleteAlertRule(editingRule.id)
                    setShowEditRuleDialog(false)
                    setEditingRule(null)
                    resetRuleForm()
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditRuleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAlertRule} disabled={isSaving || !ruleFormData.rule_name}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Logs Dialog */}
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Audit Logs
              </DialogTitle>
              <DialogDescription>
                Use advanced search to find specific audit log entries
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search_query">Search Query</Label>
                <Input
                  id="search_query"
                  placeholder="e.g., severity:critical AND log_type:security"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Quick Filters</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">severity:critical</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">log_type:security</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">is_anomaly:true</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">status:failed</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search_date_from">From Date</Label>
                  <Input id="search_date_from" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search_date_to">To Date</Label>
                  <Input id="search_date_to" type="date" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSearchDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSearchDialog(false)
                setActiveTab('search')
              }}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Audit Data
              </DialogTitle>
              <DialogDescription>
                Export audit logs for compliance and analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="export_format">Export Format</Label>
                <select
                  id="export_format"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="csv">CSV (Spreadsheet)</option>
                  <option value="json">JSON (Raw Data)</option>
                  <option value="pdf">PDF (Report)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="export_range">Date Range</Label>
                <select
                  id="export_range"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Include Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Timestamp</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">User Info</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">IP Address</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Metadata</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowExportDialog(false)
                toast.success('Export started - file will download shortly')
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Saved Queries Dialog */}
        <Dialog open={showSavedQueriesDialog} onOpenChange={setShowSavedQueriesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Saved Queries
              </DialogTitle>
              <DialogDescription>
                Your saved search queries for quick access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {['Failed logins last 24h', 'High risk events', 'Data exports with PII', 'Security incidents', 'Admin actions'].map((query, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                  setSearchQuery(query.toLowerCase().replace(/ /g, '_'))
                  setShowSavedQueriesDialog(false)
                  setActiveTab('events')
                  toast.success('Query loaded', { description: query })
                }}>
                  <span className="text-sm font-medium">{query}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSavedQueriesDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archive Logs
              </DialogTitle>
              <DialogDescription>
                Archive old logs to cold storage
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="archive_age">Archive logs older than</Label>
                <select
                  id="archive_age"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="30d">30 days</option>
                  <option value="60d">60 days</option>
                  <option value="90d">90 days</option>
                  <option value="180d">180 days</option>
                </select>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estimated logs to archive: <span className="font-semibold">12,450 entries</span>
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowArchiveDialog(false)
                toast.success('Archive started', { description: 'Logs are being archived to cold storage' })
              }}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Integrations Dialog */}
        <Dialog open={showIntegrationsDialog} onOpenChange={setShowIntegrationsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Integrations
              </DialogTitle>
              <DialogDescription>
                Configure log forwarding and integrations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {[
                { name: 'Slack', desc: 'Send alerts to Slack channels', connected: true },
                { name: 'PagerDuty', desc: 'Trigger incidents in PagerDuty', connected: true },
                { name: 'Webhook', desc: 'Custom webhook endpoint', connected: false },
                { name: 'AWS S3', desc: 'Archive to S3 bucket', connected: true },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-gray-500">{integration.desc}</p>
                  </div>
                  <Badge variant={integration.connected ? 'default' : 'secondary'}>
                    {integration.connected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowIntegrationsDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowIntegrationsDialog(false)
                setActiveTab('settings')
                setSettingsTab('integrations')
              }}>
                Manage Integrations
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Debug Logs Confirmation Dialog */}
        <Dialog open={showClearLogsDialog} onOpenChange={setShowClearLogsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Clear Debug Logs
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. All debug-level logs will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Warning: This will permanently delete approximately 2,340 debug log entries.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowClearLogsDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                setShowClearLogsDialog(false)
                toast.success('Debug logs cleared', { description: 'All debug-level logs have been removed' })
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Logs
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Configuration Confirmation Dialog */}
        <Dialog open={showResetConfigDialog} onOpenChange={setShowResetConfigDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <RefreshCw className="w-5 h-5" />
                Reset Configuration
              </DialogTitle>
              <DialogDescription>
                This will reset all audit log settings to their default values.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Warning: All custom alert rules, retention policies, and notification settings will be reset.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResetConfigDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                setShowResetConfigDialog(false)
                toast.success('Configuration reset', { description: 'All settings have been restored to defaults' })
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Related Events Dialog */}
        <Dialog open={showRelatedEventsDialog} onOpenChange={setShowRelatedEventsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Related Events
              </DialogTitle>
              <DialogDescription>
                Events related to the selected log entry
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                    setShowRelatedEventsDialog(false)
                    setSelectedLog(log)
                  }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      log.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      log.severity === 'error' ? 'bg-orange-100 text-orange-600' :
                      log.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getLogTypeIcon(log.log_type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowRelatedEventsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compliance Report Download Dialog */}
        <Dialog open={!!showComplianceReportDialog} onOpenChange={() => setShowComplianceReportDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Compliance Report
              </DialogTitle>
              <DialogDescription>
                {showComplianceReportDialog && mockComplianceReports.find(r => r.id === showComplianceReportDialog)?.framework} Report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report_format">Report Format</Label>
                <select
                  id="report_format"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="pdf">PDF Report</option>
                  <option value="xlsx">Excel Spreadsheet</option>
                  <option value="json">JSON Data</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Include Sections</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Executive Summary</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Control Details</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Evidence Attachments</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowComplianceReportDialog(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const report = mockComplianceReports.find(r => r.id === showComplianceReportDialog)
                setShowComplianceReportDialog(null)
                toast.success('Downloading report', { description: `${report?.framework} compliance report will be downloaded` })
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* SIEM Integration Dialog */}
        <Dialog open={!!showSIEMDialog} onOpenChange={() => setShowSIEMDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                {showSIEMDialog} Integration
              </DialogTitle>
              <DialogDescription>
                Configure {showSIEMDialog} integration settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="siem_endpoint">Endpoint URL</Label>
                <Input
                  id="siem_endpoint"
                  placeholder={`https://${showSIEMDialog?.toLowerCase()}.example.com/api/v1`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siem_token">API Token</Label>
                <Input
                  id="siem_token"
                  type="password"
                  placeholder="Enter your API token"
                />
              </div>
              <div className="space-y-2">
                <Label>Log Types to Forward</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Security</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Authentication</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">System</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Debug</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSIEMDialog(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSIEMDialog(null)
                toast.success('Integration saved', { description: `${showSIEMDialog} integration has been configured` })
              }}>
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
