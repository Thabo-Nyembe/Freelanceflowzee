'use client'

// SecurityDashboard - Phase 8: Enterprise Security & Compliance
// Comprehensive security monitoring and management dashboard

import React, { useState, useMemo } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  KeyRound,
  UserCheck,
  UserX,
  Users,
  Globe,
  MapPin,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Laptop,
  Monitor,
  RefreshCw,
  Download,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  Settings,
  Bell,
  BellOff,
  Ban,
  CheckSquare,
  XSquare,
  FileText,
  PieChart,
  BarChart3,
  LineChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// ============================================================================
// Types
// ============================================================================

export type SecurityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type ThreatStatus = 'active' | 'mitigated' | 'investigating' | 'resolved'
export type AuthMethod = 'password' | 'mfa' | 'sso' | 'passkey' | 'api_key'
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'pending'
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

export interface SecurityMetric {
  id: string
  name: string
  value: number
  previousValue?: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  status?: SecurityLevel
  description?: string
}

export interface ThreatAlert {
  id: string
  title: string
  description: string
  severity: SecurityLevel
  status: ThreatStatus
  source: string
  affected_users?: number
  affected_resources?: string[]
  detected_at: string
  resolved_at?: string
  recommendations?: string[]
}

export interface AuthenticationAttempt {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar?: string
  method: AuthMethod
  success: boolean
  ip_address: string
  location?: {
    city?: string
    country?: string
    country_code?: string
  }
  device?: {
    type: DeviceType
    browser?: string
    os?: string
  }
  timestamp: string
  failure_reason?: string
}

export interface ActiveSession {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar?: string
  device: {
    type: DeviceType
    browser?: string
    os?: string
    name?: string
  }
  ip_address: string
  location?: {
    city?: string
    country?: string
    country_code?: string
  }
  created_at: string
  last_activity: string
  is_current?: boolean
}

export interface ComplianceRequirement {
  id: string
  framework: string
  requirement_id: string
  title: string
  description: string
  status: ComplianceStatus
  last_checked: string
  evidence_count: number
  controls: string[]
  notes?: string
}

export interface IPWhitelistEntry {
  id: string
  ip_address: string
  description?: string
  created_by: string
  created_at: string
  expires_at?: string
  is_active: boolean
  hit_count: number
  last_hit?: string
}

export interface MFAEnrollment {
  total_users: number
  enrolled_users: number
  methods: {
    totp: number
    sms: number
    email: number
    passkey: number
    hardware_key: number
  }
  pending_enrollments: number
  grace_period_users: number
}

export interface SecurityScore {
  overall: number
  categories: {
    name: string
    score: number
    weight: number
    issues: number
    recommendations: string[]
  }[]
}

// ============================================================================
// Props
// ============================================================================

export interface SecurityDashboardProps {
  organizationId: string
  organizationName?: string

  // Data
  metrics?: SecurityMetric[]
  threats?: ThreatAlert[]
  authAttempts?: AuthenticationAttempt[]
  activeSessions?: ActiveSession[]
  compliance?: ComplianceRequirement[]
  ipWhitelist?: IPWhitelistEntry[]
  mfaEnrollment?: MFAEnrollment
  securityScore?: SecurityScore

  // Configuration
  variant?: 'full' | 'compact' | 'overview'
  showRealTimeUpdates?: boolean
  refreshInterval?: number

  // Callbacks
  onRefresh?: () => Promise<void>
  onThreatAction?: (threatId: string, action: 'investigate' | 'mitigate' | 'resolve' | 'dismiss') => Promise<void>
  onSessionRevoke?: (sessionId: string) => Promise<void>
  onIPWhitelistAdd?: (ip: string, description?: string) => Promise<void>
  onIPWhitelistRemove?: (entryId: string) => Promise<void>
  onExportReport?: (format: 'pdf' | 'csv' | 'json') => Promise<void>
  onSettingsChange?: (settings: Record<string, unknown>) => Promise<void>

  className?: string
}

// ============================================================================
// Helper Components
// ============================================================================

function SecurityLevelBadge({ level }: { level: SecurityLevel }) {
  const config = {
    critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Critical' },
    high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' },
    medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Medium' },
    low: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Low' },
    info: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', label: 'Info' },
  }

  const { color, label } = config[level]

  return (
    <Badge className={cn('font-medium', color)}>
      {label}
    </Badge>
  )
}

function ThreatStatusBadge({ status }: { status: ThreatStatus }) {
  const config = {
    active: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Active', icon: AlertCircle },
    investigating: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Investigating', icon: Eye },
    mitigated: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Mitigated', icon: Shield },
    resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Resolved', icon: CheckCircle2 },
  }

  const { color, label, icon: Icon } = config[status]

  return (
    <Badge className={cn('font-medium gap-1', color)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function ComplianceStatusBadge({ status }: { status: ComplianceStatus }) {
  const config = {
    compliant: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Compliant', icon: CheckCircle2 },
    non_compliant: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Non-Compliant', icon: XCircle },
    partial: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Partial', icon: AlertTriangle },
    pending: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', label: 'Pending', icon: Clock },
  }

  const { color, label, icon: Icon } = config[status]

  return (
    <Badge className={cn('font-medium gap-1', color)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function DeviceIcon({ type }: { type: DeviceType }) {
  switch (type) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />
    case 'tablet':
      return <Laptop className="h-4 w-4" />
    case 'desktop':
      return <Monitor className="h-4 w-4" />
    default:
      return <Monitor className="h-4 w-4 text-muted-foreground" />
  }
}

function AuthMethodIcon({ method }: { method: AuthMethod }) {
  switch (method) {
    case 'password':
      return <Lock className="h-4 w-4" />
    case 'mfa':
      return <KeyRound className="h-4 w-4" />
    case 'sso':
      return <Users className="h-4 w-4" />
    case 'passkey':
      return <Fingerprint className="h-4 w-4" />
    case 'api_key':
      return <Key className="h-4 w-4" />
    default:
      return <Lock className="h-4 w-4" />
  }
}

function MetricCard({ metric }: { metric: SecurityMetric }) {
  const trendIcon = metric.trend === 'up'
    ? TrendingUp
    : metric.trend === 'down'
      ? TrendingDown
      : null

  const trendColor = metric.status === 'critical' || metric.status === 'high'
    ? metric.trend === 'up' ? 'text-red-500' : 'text-green-500'
    : metric.trend === 'up' ? 'text-green-500' : 'text-red-500'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.name}
        </CardTitle>
        {metric.status && <SecurityLevelBadge level={metric.status} />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {metric.value.toLocaleString()}
          </span>
          {metric.unit && (
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          )}
          {trendIcon && metric.previousValue !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
              {React.createElement(trendIcon, { className: 'h-4 w-4' })}
              <span>
                {Math.abs(((metric.value - metric.previousValue) / metric.previousValue) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {metric.description && (
          <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function SecurityScoreGauge({ score, size = 'default' }: { score: number; size?: 'default' | 'large' }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-500'
    if (s >= 70) return 'text-yellow-500'
    if (s >= 50) return 'text-orange-500'
    return 'text-red-500'
  }

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent'
    if (s >= 70) return 'Good'
    if (s >= 50) return 'Fair'
    return 'Poor'
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn('relative', size === 'large' ? 'w-48 h-48' : 'w-32 h-32')}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500', getColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', size === 'large' ? 'text-4xl' : 'text-2xl')}>
          {score}
        </span>
        <span className={cn('text-muted-foreground', size === 'large' ? 'text-sm' : 'text-xs')}>
          {getLabel(score)}
        </span>
      </div>
    </div>
  )
}

function ThreatAlertCard({
  threat,
  onAction
}: {
  threat: ThreatAlert
  onAction?: (action: 'investigate' | 'mitigate' | 'resolve' | 'dismiss') => void
}) {
  return (
    <Card className={cn(
      'border-l-4',
      threat.severity === 'critical' && 'border-l-red-500',
      threat.severity === 'high' && 'border-l-orange-500',
      threat.severity === 'medium' && 'border-l-yellow-500',
      threat.severity === 'low' && 'border-l-blue-500',
      threat.severity === 'info' && 'border-l-gray-500'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{threat.title}</CardTitle>
            <CardDescription>{threat.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SecurityLevelBadge level={threat.severity} />
            <ThreatStatusBadge status={threat.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>Source: {threat.source}</span>
          </div>
          {threat.affected_users !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{threat.affected_users} affected users</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Detected: {new Date(threat.detected_at).toLocaleString()}</span>
          </div>
        </div>
        {threat.recommendations && threat.recommendations.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Recommendations:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {threat.recommendations.slice(0, 2).map((rec, i) => (
                <li key={i} className="flex items-start gap-1">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {onAction && threat.status !== 'resolved' && (
        <CardFooter className="pt-2">
          <div className="flex gap-2">
            {threat.status === 'active' && (
              <>
                <Button size="sm" variant="outline" onClick={() => onAction('investigate')}>
                  <Eye className="h-4 w-4 mr-1" />
                  Investigate
                </Button>
                <Button size="sm" onClick={() => onAction('mitigate')}>
                  <Shield className="h-4 w-4 mr-1" />
                  Mitigate
                </Button>
              </>
            )}
            {threat.status === 'investigating' && (
              <Button size="sm" onClick={() => onAction('mitigate')}>
                <Shield className="h-4 w-4 mr-1" />
                Mitigate
              </Button>
            )}
            {threat.status === 'mitigated' && (
              <Button size="sm" onClick={() => onAction('resolve')}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Resolved
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onAction('dismiss')}>
              Dismiss
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

function AuthAttemptRow({ attempt }: { attempt: AuthenticationAttempt }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 rounded-lg">
      <Avatar className="h-9 w-9">
        <AvatarImage src={attempt.user_avatar} />
        <AvatarFallback>
          {attempt.user_name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{attempt.user_name}</span>
          <span className="text-sm text-muted-foreground truncate">{attempt.user_email}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <div className="flex items-center gap-1">
            <AuthMethodIcon method={attempt.method} />
            <span className="capitalize">{attempt.method.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>{attempt.ip_address}</span>
          </div>
          {attempt.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{[attempt.location.city, attempt.location.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-xs text-muted-foreground">
            {new Date(attempt.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {attempt.success ? (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="gap-1 text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <XCircle className="h-3 w-3" />
                  Failed
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{attempt.failure_reason || 'Authentication failed'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

function SessionRow({
  session,
  onRevoke
}: {
  session: ActiveSession
  onRevoke?: () => void
}) {
  return (
    <div className={cn(
      'flex items-center gap-4 py-3 px-4 rounded-lg',
      session.is_current ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
    )}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
        <DeviceIcon type={session.device.type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {session.device.name || `${session.device.browser} on ${session.device.os}`}
          </span>
          {session.is_current && (
            <Badge variant="secondary" className="text-xs">Current</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>{session.ip_address}</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{[session.location.city, session.location.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Last active: {new Date(session.last_activity).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!session.is_current && onRevoke && (
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={onRevoke}>
            Revoke
          </Button>
        )}
      </div>
    </div>
  )
}

function MFAEnrollmentCard({ enrollment }: { enrollment: MFAEnrollment }) {
  const enrollmentRate = (enrollment.enrolled_users / enrollment.total_users) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">MFA Enrollment</CardTitle>
        <CardDescription>Multi-factor authentication status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Enrollment Rate</span>
          <span className="text-2xl font-bold">{enrollmentRate.toFixed(1)}%</span>
        </div>
        <Progress value={enrollmentRate} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{enrollment.enrolled_users.toLocaleString()} enrolled</span>
          <span>{enrollment.total_users.toLocaleString()} total</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Methods Distribution</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(enrollment.methods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{method.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {(enrollment.pending_enrollments > 0 || enrollment.grace_period_users > 0) && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              {enrollment.pending_enrollments > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.pending_enrollments} pending</span>
                </div>
              )}
              {enrollment.grace_period_users > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{enrollment.grace_period_users} in grace period</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SecurityDashboard({
  organizationId,
  organizationName,
  metrics = [],
  threats = [],
  authAttempts = [],
  activeSessions = [],
  compliance = [],
  ipWhitelist = [],
  mfaEnrollment,
  securityScore,
  variant = 'full',
  showRealTimeUpdates = false,
  refreshInterval = 30000,
  onRefresh,
  onThreatAction,
  onSessionRevoke,
  onIPWhitelistAdd,
  onIPWhitelistRemove,
  onExportReport,
  onSettingsChange,
  className,
}: SecurityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [showAddIPDialog, setShowAddIPDialog] = useState(false)
  const [newIPAddress, setNewIPAddress] = useState('')
  const [newIPDescription, setNewIPDescription] = useState('')

  // Filter threats
  const filteredThreats = useMemo(() => {
    return threats.filter((threat) =>
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [threats, searchQuery])

  // Active threats count
  const activeThreatsCount = threats.filter(t => t.status === 'active' || t.status === 'investigating').length
  const criticalThreatsCount = threats.filter(t => t.severity === 'critical' && t.status === 'active').length

  // Auth stats
  const recentAuthAttempts = authAttempts.slice(0, 50)
  const failedAuthRate = authAttempts.length > 0
    ? (authAttempts.filter(a => !a.success).length / authAttempts.length) * 100
    : 0

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle add IP to whitelist
  const handleAddIP = async () => {
    if (newIPAddress && onIPWhitelistAdd) {
      await onIPWhitelistAdd(newIPAddress, newIPDescription)
      setNewIPAddress('')
      setNewIPDescription('')
      setShowAddIPDialog(false)
    }
  }

  // Compliance stats
  const complianceStats = useMemo(() => {
    const total = compliance.length
    const compliant = compliance.filter(c => c.status === 'compliant').length
    const nonCompliant = compliance.filter(c => c.status === 'non_compliant').length
    const partial = compliance.filter(c => c.status === 'partial').length
    const pending = compliance.filter(c => c.status === 'pending').length

    return { total, compliant, nonCompliant, partial, pending, rate: total > 0 ? (compliant / total) * 100 : 0 }
  }, [compliance])

  // Overview variant
  if (variant === 'overview') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className="text-2xl font-bold">{securityScore?.overall || 0}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Threats</p>
                  <p className="text-2xl font-bold">{activeThreatsCount}</p>
                </div>
                <ShieldAlert className={cn('h-8 w-8', activeThreatsCount > 0 ? 'text-red-500' : 'text-green-500')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{activeSessions.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{complianceStats.rate.toFixed(0)}%</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalThreatsCount > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-600 dark:text-red-400">
                  {criticalThreatsCount} critical threat{criticalThreatsCount > 1 ? 's' : ''} require immediate attention
                </span>
                <Button size="sm" variant="destructive" className="ml-auto">
                  View Threats
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Full dashboard
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            {organizationName ? `Security overview for ${organizationName}` : 'Monitor and manage security'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
          {onExportReport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExportReport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportReport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportReport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalThreatsCount > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-200">
                  Critical Security Alert
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {criticalThreatsCount} critical threat{criticalThreatsCount > 1 ? 's' : ''} detected.
                  Immediate action required.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setActiveTab('threats')}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Security Score */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Security Score</CardTitle>
            <CardDescription>Overall security posture</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <SecurityScoreGauge score={securityScore?.overall || 0} size="large" />
            {securityScore?.categories && (
              <div className="w-full mt-6 space-y-3">
                {securityScore.categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{category.name}</span>
                      <span className="font-medium">{category.score}</span>
                    </div>
                    <Progress value={category.score} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.slice(0, 8).map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats" className="relative">
            Threats
            {activeThreatsCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {activeThreatsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* MFA Enrollment */}
            <div className="col-span-12 md:col-span-4">
              {mfaEnrollment && <MFAEnrollmentCard enrollment={mfaEnrollment} />}
            </div>

            {/* Recent Threats */}
            <div className="col-span-12 md:col-span-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Threats</CardTitle>
                    <CardDescription>Latest security alerts</CardDescription>
                  </div>
                  <Button variant="link" onClick={() => setActiveTab('threats')}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {threats.slice(0, 3).map((threat) => (
                      <ThreatAlertCard
                        key={threat.id}
                        threat={threat}
                        onAction={onThreatAction ? (action) => onThreatAction(threat.id, action) : undefined}
                      />
                    ))}
                    {threats.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
                        <p>No active threats detected</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Authentication</CardTitle>
                <CardDescription>Latest login attempts</CardDescription>
              </div>
              <Button variant="link" onClick={() => setActiveTab('authentication')}>
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentAuthAttempts.slice(0, 5).map((attempt) => (
                  <AuthAttemptRow key={attempt.id} attempt={attempt} />
                ))}
                {authAttempts.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">No recent authentication attempts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="mitigated">Mitigated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredThreats.map((threat) => (
              <ThreatAlertCard
                key={threat.id}
                threat={threat}
                onAction={onThreatAction ? (action) => onThreatAction(threat.id, action) : undefined}
              />
            ))}
            {filteredThreats.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="text-lg font-medium">All Clear</p>
                    <p className="text-sm">No threats matching your criteria</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Attempts</div>
                <div className="text-2xl font-bold">{authAttempts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Successful</div>
                <div className="text-2xl font-bold text-green-600">
                  {authAttempts.filter(a => a.success).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {authAttempts.filter(a => !a.success).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Failure Rate</div>
                <div className="text-2xl font-bold">{failedAuthRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Attempts List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Authentication Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {recentAuthAttempts.map((attempt) => (
                    <AuthAttemptRow key={attempt.id} attempt={attempt} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">{activeSessions.length} active sessions</p>
            </div>
            {onSessionRevoke && activeSessions.length > 1 && (
              <Button variant="outline" className="text-red-600">
                Revoke All Other Sessions
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    onRevoke={onSessionRevoke && !session.is_current ? () => onSessionRevoke(session.id) : undefined}
                  />
                ))}
                {activeSessions.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No active sessions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          {/* Compliance Overview */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Requirements</div>
                <div className="text-2xl font-bold">{complianceStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Compliant</div>
                <div className="text-2xl font-bold text-green-600">{complianceStats.compliant}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Non-Compliant</div>
                <div className="text-2xl font-bold text-red-600">{complianceStats.nonCompliant}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Partial</div>
                <div className="text-2xl font-bold text-yellow-600">{complianceStats.partial}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Compliance Rate</div>
                <div className="text-2xl font-bold">{complianceStats.rate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {compliance.map((req) => (
                    <div key={req.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{req.framework}</Badge>
                          <span className="text-xs text-muted-foreground">{req.requirement_id}</span>
                        </div>
                        <h4 className="font-medium">{req.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{req.evidence_count} evidence items</span>
                          <span>Last checked: {new Date(req.last_checked).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ComplianceStatusBadge status={req.status} />
                    </div>
                  ))}
                  {compliance.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No compliance requirements configured</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* IP Whitelist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">IP Whitelist</CardTitle>
                <CardDescription>Manage allowed IP addresses</CardDescription>
              </div>
              <Dialog open={showAddIPDialog} onOpenChange={setShowAddIPDialog}>
                <DialogTrigger asChild>
                  <Button>Add IP Address</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add IP to Whitelist</DialogTitle>
                    <DialogDescription>
                      Add a trusted IP address to the whitelist
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="ip">IP Address</Label>
                      <Input
                        id="ip"
                        placeholder="192.168.1.1 or 192.168.1.0/24"
                        value={newIPAddress}
                        onChange={(e) => setNewIPAddress(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        placeholder="Office network"
                        value={newIPDescription}
                        onChange={(e) => setNewIPDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddIPDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddIP} disabled={!newIPAddress}>
                      Add IP
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ipWhitelist.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-medium">{entry.ip_address}</span>
                        {!entry.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.hit_count} hits • Last used: {entry.last_hit ? new Date(entry.last_hit).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={entry.is_active} />
                      {onIPWhitelistRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onIPWhitelistRemove(entry.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {ipWhitelist.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">No IP addresses whitelisted</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
              <CardDescription>Configure security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require MFA for all users</Label>
                  <p className="text-sm text-muted-foreground">Enforce multi-factor authentication</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Session timeout</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Failed login lockout</Label>
                  <p className="text-sm text-muted-foreground">Lock account after failed attempts</p>
                </div>
                <Select defaultValue="5">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                    <SelectItem value="0">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password policy</Label>
                  <p className="text-sm text-muted-foreground">Minimum password requirements</p>
                </div>
                <Select defaultValue="strong">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ chars)</SelectItem>
                    <SelectItem value="medium">Medium (12+ chars)</SelectItem>
                    <SelectItem value="strong">Strong (14+ chars, mixed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Security alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for security events</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityDashboard
