'use client'

// SessionManager - Phase 8: Enterprise Security & Compliance
// Comprehensive session management and monitoring component

import React, { useState, useMemo, useCallback } from 'react'
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  MapPin,
  Clock,
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Users,
  User,
  LogOut,
  Ban,
  Trash2,
  History,
  Settings,
  Fingerprint,
  Chrome,
  Layers,
  Wifi,
  WifiOff,
  Zap,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, formatDistanceToNow, parseISO, differenceInMinutes, isToday } from 'date-fns'

// ============================================================================
// Types
// ============================================================================

export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'unknown'
export type SessionStatus = 'active' | 'idle' | 'expired' | 'revoked' | 'locked'
export type AuthMethod = 'password' | 'mfa' | 'sso' | 'passkey' | 'api_key' | 'oauth'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface SessionDevice {
  type: DeviceType
  name?: string
  model?: string
  os?: string
  os_version?: string
  browser?: string
  browser_version?: string
  is_mobile: boolean
  is_bot?: boolean
}

export interface SessionLocation {
  ip_address: string
  city?: string
  region?: string
  country?: string
  country_code?: string
  timezone?: string
  isp?: string
  is_vpn?: boolean
  is_proxy?: boolean
  is_tor?: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface SessionUser {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  department?: string
}

export interface Session {
  id: string
  user: SessionUser
  device: SessionDevice
  location: SessionLocation
  status: SessionStatus
  auth_method: AuthMethod
  risk_level: RiskLevel

  created_at: string
  last_activity: string
  expires_at: string
  duration_minutes?: number

  is_current?: boolean
  is_remembered?: boolean
  mfa_verified?: boolean
  permissions?: string[]

  activity_count?: number
  request_count?: number
  last_endpoint?: string

  metadata?: Record<string, unknown>
}

export interface SessionPolicy {
  max_sessions_per_user: number
  session_timeout_minutes: number
  idle_timeout_minutes: number
  require_mfa: boolean
  allow_remember_me: boolean
  remember_me_duration_days: number
  restrict_concurrent_sessions: boolean
  enforce_location_binding: boolean
  enforce_device_binding: boolean
  allow_api_keys: boolean
  api_key_max_age_days: number
}

export interface SessionStats {
  total_active: number
  total_idle: number
  total_expired: number
  by_device: Record<DeviceType, number>
  by_auth_method: Record<AuthMethod, number>
  by_risk_level: Record<RiskLevel, number>
  by_location: { country: string; count: number }[]
  peak_concurrent: number
  average_duration_minutes: number
  unique_users: number
}

// ============================================================================
// Props
// ============================================================================

export interface SessionManagerProps {
  sessions: Session[]
  currentSessionId?: string
  currentUserId?: string
  stats?: SessionStats
  policy?: SessionPolicy

  // Configuration
  variant?: 'full' | 'compact' | 'user' | 'admin'
  showStats?: boolean
  showPolicy?: boolean
  allowBulkActions?: boolean
  enableRealtime?: boolean

  // Callbacks
  onRefresh?: () => Promise<void>
  onRevokeSession?: (sessionId: string) => Promise<void>
  onRevokeSessions?: (sessionIds: string[]) => Promise<void>
  onRevokeAllUserSessions?: (userId: string, excludeCurrent?: boolean) => Promise<void>
  onRevokeAllSessions?: (excludeCurrent?: boolean) => Promise<void>
  onLockSession?: (sessionId: string) => Promise<void>
  onUnlockSession?: (sessionId: string) => Promise<void>
  onUpdatePolicy?: (policy: Partial<SessionPolicy>) => Promise<void>
  onExport?: (format: 'csv' | 'json') => Promise<void>

  isLoading?: boolean
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const DEVICE_ICONS: Record<DeviceType, React.ElementType> = {
  desktop: Monitor,
  laptop: Laptop,
  tablet: Tablet,
  mobile: Smartphone,
  unknown: Monitor,
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: Activity,
  },
  idle: {
    label: 'Idle',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: Clock,
  },
  revoked: {
    label: 'Revoked',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
  locked: {
    label: 'Locked',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: Lock,
  },
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; icon: React.ElementType }> = {
  low: { label: 'Low Risk', color: 'text-green-600', icon: ShieldCheck },
  medium: { label: 'Medium Risk', color: 'text-yellow-600', icon: Shield },
  high: { label: 'High Risk', color: 'text-orange-600', icon: ShieldAlert },
  critical: { label: 'Critical Risk', color: 'text-red-600', icon: ShieldOff },
}

const AUTH_METHOD_CONFIG: Record<AuthMethod, { label: string; icon: React.ElementType }> = {
  password: { label: 'Password', icon: Lock },
  mfa: { label: 'MFA', icon: Key },
  sso: { label: 'SSO', icon: Users },
  passkey: { label: 'Passkey', icon: Fingerprint },
  api_key: { label: 'API Key', icon: Key },
  oauth: { label: 'OAuth', icon: Layers },
}

// ============================================================================
// Helper Components
// ============================================================================

function DeviceIcon({ type, className }: { type: DeviceType; className?: string }) {
  const Icon = DEVICE_ICONS[type]
  return <Icon className={cn('h-4 w-4', className)} />
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge className={cn('gap-1 font-medium', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function RiskIndicator({ level }: { level: RiskLevel }) {
  const config = RISK_CONFIG[level]
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon className={cn('h-4 w-4', config.color)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function AuthMethodBadge({ method }: { method: AuthMethod }) {
  const config = AUTH_METHOD_CONFIG[method]
  const Icon = config.icon

  return (
    <Badge variant="outline" className="gap-1 text-xs">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function LocationDisplay({ location }: { location: SessionLocation }) {
  const parts = [location.city, location.region, location.country].filter(Boolean)

  return (
    <div className="flex items-center gap-2 text-sm">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span>{parts.join(', ') || location.ip_address}</span>
      {(location.is_vpn || location.is_proxy || location.is_tor) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {location.is_tor ? 'Tor network detected' :
                  location.is_vpn ? 'VPN detected' : 'Proxy detected'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

function DeviceDisplay({ device }: { device: SessionDevice }) {
  const Icon = DEVICE_ICONS[device.type]
  const displayName = device.name ||
    `${device.browser || 'Unknown'} on ${device.os || 'Unknown'}`

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{displayName}</p>
        {device.browser && device.os && (
          <p className="text-xs text-muted-foreground">
            {device.browser} {device.browser_version} / {device.os} {device.os_version}
          </p>
        )}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  isCurrent = false,
  onRevoke,
  onLock,
  onUnlock,
  onClick
}: {
  session: Session
  isCurrent?: boolean
  onRevoke?: () => void
  onLock?: () => void
  onUnlock?: () => void
  onClick?: () => void
}) {
  const isActive = session.status === 'active'
  const isIdle = session.status === 'idle'
  const minutesAgo = differenceInMinutes(new Date(), parseISO(session.last_activity))

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isCurrent && 'border-primary',
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {/* Device Icon */}
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full',
            isActive ? 'bg-green-100 dark:bg-green-900/30' :
              isIdle ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-gray-100 dark:bg-gray-800'
          )}>
            <DeviceIcon
              type={session.device.type}
              className={cn(
                'h-6 w-6',
                isActive ? 'text-green-600' :
                  isIdle ? 'text-yellow-600' :
                    'text-gray-500'
              )}
            />
          </div>

          {/* Session Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {session.device.name || session.device.browser || 'Unknown Device'}
              </span>
              {isCurrent && (
                <Badge variant="secondary" className="text-xs">Current Session</Badge>
              )}
              <StatusBadge status={session.status} />
              <RiskIndicator level={session.risk_level} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[session.location.city, session.location.country].filter(Boolean).join(', ') || session.location.ip_address}
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {minutesAgo < 1 ? 'Just now' :
                  minutesAgo < 60 ? `${minutesAgo}m ago` :
                    formatDistanceToNow(parseISO(session.last_activity), { addSuffix: true })}
              </div>
              <AuthMethodBadge method={session.auth_method} />
              {session.mfa_verified && (
                <Badge variant="outline" className="text-xs text-green-600">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  MFA
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>Started: {format(parseISO(session.created_at), 'MMM d, h:mm a')}</span>
              <span className="text-muted-foreground/50">|</span>
              <span>Expires: {format(parseISO(session.expires_at), 'MMM d, h:mm a')}</span>
            </div>
          </div>

          {/* Actions */}
          {(onRevoke || onLock || onUnlock) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Session Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session.status === 'locked' && onUnlock && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUnlock(); }}>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock Session
                  </DropdownMenuItem>
                )}
                {session.status !== 'locked' && onLock && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onLock(); }}>
                    <Lock className="h-4 w-4 mr-2" />
                    Lock Session
                  </DropdownMenuItem>
                )}
                {onRevoke && !isCurrent && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => { e.stopPropagation(); onRevoke(); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Revoke Session
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SessionRow({
  session,
  isCurrent = false,
  isSelected = false,
  onSelect,
  onRevoke,
  onLock,
  onUnlock
}: {
  session: Session
  isCurrent?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onRevoke?: () => void
  onLock?: () => void
  onUnlock?: () => void
}) {
  const minutesAgo = differenceInMinutes(new Date(), parseISO(session.last_activity))

  return (
    <TableRow className={cn(isCurrent && 'bg-primary/5')}>
      {onSelect && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            disabled={isCurrent}
          />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.avatar} />
            <AvatarFallback>
              {session.user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <DeviceIcon type={session.device.type} />
          <span className="text-sm">
            {session.device.browser || 'Unknown'} / {session.device.os || 'Unknown'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="h-3 w-3 text-muted-foreground" />
          {[session.location.city, session.location.country_code].filter(Boolean).join(', ') ||
            session.location.ip_address}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusBadge status={session.status} />
          {isCurrent && (
            <Badge variant="secondary" className="text-xs">Current</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <RiskIndicator level={session.risk_level} />
          <AuthMethodBadge method={session.auth_method} />
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {minutesAgo < 1 ? 'Just now' :
            minutesAgo < 60 ? `${minutesAgo}m ago` :
              formatDistanceToNow(parseISO(session.last_activity), { addSuffix: true })}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {session.status === 'locked' && onUnlock && (
              <DropdownMenuItem onClick={onUnlock}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock
              </DropdownMenuItem>
            )}
            {session.status !== 'locked' && onLock && (
              <DropdownMenuItem onClick={onLock}>
                <Lock className="h-4 w-4 mr-2" />
                Lock
              </DropdownMenuItem>
            )}
            {onRevoke && !isCurrent && (
              <DropdownMenuItem className="text-red-600" onClick={onRevoke}>
                <LogOut className="h-4 w-4 mr-2" />
                Revoke
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function SessionPolicyEditor({
  policy,
  onChange,
  onSave
}: {
  policy: SessionPolicy
  onChange: (updates: Partial<SessionPolicy>) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Session Limits */}
        <div className="space-y-4">
          <h4 className="font-medium">Session Limits</h4>

          <div className="space-y-2">
            <Label htmlFor="max_sessions">Max Sessions Per User</Label>
            <Input
              id="max_sessions"
              type="number"
              value={policy.max_sessions_per_user}
              onChange={(e) => onChange({ max_sessions_per_user: parseInt(e.target.value) })}
              min={1}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
            <Input
              id="session_timeout"
              type="number"
              value={policy.session_timeout_minutes}
              onChange={(e) => onChange({ session_timeout_minutes: parseInt(e.target.value) })}
              min={5}
              max={10080}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idle_timeout">Idle Timeout (minutes)</Label>
            <Input
              id="idle_timeout"
              type="number"
              value={policy.idle_timeout_minutes}
              onChange={(e) => onChange({ idle_timeout_minutes: parseInt(e.target.value) })}
              min={1}
              max={1440}
            />
          </div>
        </div>

        {/* Security Options */}
        <div className="space-y-4">
          <h4 className="font-medium">Security Options</h4>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require MFA</Label>
              <p className="text-xs text-muted-foreground">Require MFA for all sessions</p>
            </div>
            <Switch
              checked={policy.require_mfa}
              onCheckedChange={(checked) => onChange({ require_mfa: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Restrict Concurrent Sessions</Label>
              <p className="text-xs text-muted-foreground">Only allow one active session</p>
            </div>
            <Switch
              checked={policy.restrict_concurrent_sessions}
              onCheckedChange={(checked) => onChange({ restrict_concurrent_sessions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Location Binding</Label>
              <p className="text-xs text-muted-foreground">Bind sessions to location</p>
            </div>
            <Switch
              checked={policy.enforce_location_binding}
              onCheckedChange={(checked) => onChange({ enforce_location_binding: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Device Binding</Label>
              <p className="text-xs text-muted-foreground">Bind sessions to device</p>
            </div>
            <Switch
              checked={policy.enforce_device_binding}
              onCheckedChange={(checked) => onChange({ enforce_device_binding: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Remember Me & API Keys */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Remember Me</h4>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Remember Me</Label>
              <p className="text-xs text-muted-foreground">Allow persistent sessions</p>
            </div>
            <Switch
              checked={policy.allow_remember_me}
              onCheckedChange={(checked) => onChange({ allow_remember_me: checked })}
            />
          </div>

          {policy.allow_remember_me && (
            <div className="space-y-2">
              <Label htmlFor="remember_duration">Remember Duration (days)</Label>
              <Input
                id="remember_duration"
                type="number"
                value={policy.remember_me_duration_days}
                onChange={(e) => onChange({ remember_me_duration_days: parseInt(e.target.value) })}
                min={1}
                max={365}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">API Keys</h4>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow API Keys</Label>
              <p className="text-xs text-muted-foreground">Allow API key authentication</p>
            </div>
            <Switch
              checked={policy.allow_api_keys}
              onCheckedChange={(checked) => onChange({ allow_api_keys: checked })}
            />
          </div>

          {policy.allow_api_keys && (
            <div className="space-y-2">
              <Label htmlFor="api_key_max_age">API Key Max Age (days)</Label>
              <Input
                id="api_key_max_age"
                type="number"
                value={policy.api_key_max_age_days}
                onChange={(e) => onChange({ api_key_max_age_days: parseInt(e.target.value) })}
                min={1}
                max={365}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>Save Policy</Button>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SessionManager({
  sessions,
  currentSessionId,
  currentUserId,
  stats,
  policy,
  variant = 'full',
  showStats = true,
  showPolicy = true,
  allowBulkActions = true,
  enableRealtime = false,
  onRefresh,
  onRevokeSession,
  onRevokeSessions,
  onRevokeAllUserSessions,
  onRevokeAllSessions,
  onLockSession,
  onUnlockSession,
  onUpdatePolicy,
  onExport,
  isLoading = false,
  className,
}: SessionManagerProps) {
  const [activeTab, setActiveTab] = useState('sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [deviceFilter, setDeviceFilter] = useState<DeviceType | 'all'>('all')
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [localPolicy, setLocalPolicy] = useState<SessionPolicy | null>(policy || null)
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false)

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (statusFilter !== 'all' && session.status !== statusFilter) return false
      if (deviceFilter !== 'all' && session.device.type !== deviceFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          session.user.name.toLowerCase().includes(query) ||
          session.user.email.toLowerCase().includes(query) ||
          session.location.ip_address.includes(query) ||
          session.device.browser?.toLowerCase().includes(query) ||
          session.device.os?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [sessions, statusFilter, deviceFilter, searchQuery])

  // Current user sessions (for user variant)
  const userSessions = useMemo(() => {
    if (!currentUserId) return filteredSessions
    return filteredSessions.filter((s) => s.user.id === currentUserId)
  }, [filteredSessions, currentUserId])

  // Session counts
  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'idle').length
  const highRiskSessions = sessions.filter((s) => s.risk_level === 'high' || s.risk_level === 'critical').length

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle bulk actions
  const handleBulkRevoke = async () => {
    if (onRevokeSessions && selectedSessions.size > 0) {
      await onRevokeSessions(Array.from(selectedSessions))
      setSelectedSessions(new Set())
    }
  }

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const selectableIds = filteredSessions
        .filter((s) => s.id !== currentSessionId)
        .map((s) => s.id)
      setSelectedSessions(new Set(selectableIds))
    } else {
      setSelectedSessions(new Set())
    }
  }

  // Toggle session selection
  const toggleSessionSelection = (sessionId: string) => {
    const newSet = new Set(selectedSessions)
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId)
    } else {
      newSet.add(sessionId)
    }
    setSelectedSessions(newSet)
  }

  // User variant (simplified for end users)
  if (variant === 'user') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Sessions</h2>
            <p className="text-muted-foreground">
              {userSessions.length} active session{userSessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              </Button>
            )}
            {onRevokeAllUserSessions && userSessions.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out Other Sessions
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out of other sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all other devices and browsers.
                      You'll remain signed in on this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onRevokeAllUserSessions(currentUserId!, true)}
                    >
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {userSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrent={session.id === currentSessionId}
              onRevoke={onRevokeSession && session.id !== currentSessionId
                ? () => onRevokeSession(session.id)
                : undefined}
            />
          ))}
          {userSessions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No sessions found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Full/Admin variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session Manager</h2>
          <p className="text-muted-foreground">
            {activeSessions} active sessions
            {highRiskSessions > 0 && (
              <span className="text-red-600 ml-2">
                ({highRiskSessions} high risk)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          )}

          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onRevokeAllSessions && (
            <AlertDialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Revoke All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign out all users from all devices.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      onRevokeAllSessions(true)
                      setShowRevokeAllDialog(false)
                    }}
                  >
                    Revoke All Sessions
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.total_active}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Idle</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.total_idle}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Users</p>
                  <p className="text-2xl font-bold">{stats.unique_users}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(stats.by_risk_level.high || 0) + (stats.by_risk_level.critical || 0)}
                  </p>
                </div>
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{stats.average_duration_minutes}m</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          {showPolicy && policy && <TabsTrigger value="policy">Policy</TabsTrigger>}
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user, IP, or device..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SessionStatus | 'all')}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={deviceFilter} onValueChange={(v) => setDeviceFilter(v as DeviceType | 'all')}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {allowBulkActions && selectedSessions.size > 0 && (
            <Card className="border-primary">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedSessions.size} session{selectedSessions.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSessions(new Set())}>
                      Clear Selection
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkRevoke}>
                      <LogOut className="h-4 w-4 mr-1" />
                      Revoke Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessions Table */}
          <Card>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No sessions found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {allowBulkActions && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                filteredSessions.filter(s => s.id !== currentSessionId).length > 0 &&
                                selectedSessions.size === filteredSessions.filter(s => s.id !== currentSessionId).length
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                        )}
                        <TableHead>User</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Security</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <SessionRow
                          key={session.id}
                          session={session}
                          isCurrent={session.id === currentSessionId}
                          isSelected={selectedSessions.has(session.id)}
                          onSelect={allowBulkActions ? (selected) => {
                            if (selected) {
                              setSelectedSessions(new Set([...selectedSessions, session.id]))
                            } else {
                              const newSet = new Set(selectedSessions)
                              newSet.delete(session.id)
                              setSelectedSessions(newSet)
                            }
                          } : undefined}
                          onRevoke={onRevokeSession && session.id !== currentSessionId
                            ? () => onRevokeSession(session.id)
                            : undefined}
                          onLock={onLockSession && session.status !== 'locked'
                            ? () => onLockSession(session.id)
                            : undefined}
                          onUnlock={onUnlockSession && session.status === 'locked'
                            ? () => onUnlockSession(session.id)
                            : undefined}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Tab */}
        {showPolicy && localPolicy && (
          <TabsContent value="policy">
            <Card>
              <CardHeader>
                <CardTitle>Session Policy</CardTitle>
                <CardDescription>Configure session security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <SessionPolicyEditor
                  policy={localPolicy}
                  onChange={(updates) => setLocalPolicy({ ...localPolicy, ...updates })}
                  onSave={() => onUpdatePolicy?.(localPolicy)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default SessionManager
