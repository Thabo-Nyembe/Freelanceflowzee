'use client'

// AuditLogViewer - Phase 8: Enterprise Security & Compliance
// Comprehensive audit log viewing, filtering, and export component

import React, { useState, useMemo, useCallback } from 'react'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Globe,
  Clock,
  Activity,
  FileText,
  Database,
  Settings,
  Shield,
  Key,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Eye,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ListFilter,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

// ============================================================================
// Types
// ============================================================================

export type AuditAction =
  // Authentication
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_changed'
  | 'password_reset'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_verified'
  | 'mfa_failed'
  | 'session_created'
  | 'session_revoked'
  | 'token_generated'
  | 'token_revoked'
  // User Management
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_invited'
  | 'user_activated'
  | 'user_deactivated'
  | 'user_role_changed'
  // Team/Org Management
  | 'team_created'
  | 'team_updated'
  | 'team_deleted'
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  // Resource Operations
  | 'resource_created'
  | 'resource_updated'
  | 'resource_deleted'
  | 'resource_viewed'
  | 'resource_exported'
  | 'resource_shared'
  | 'resource_unshared'
  // Security
  | 'permission_granted'
  | 'permission_revoked'
  | 'api_key_created'
  | 'api_key_deleted'
  | 'webhook_created'
  | 'webhook_updated'
  | 'webhook_deleted'
  | 'ip_whitelisted'
  | 'ip_removed'
  // Settings
  | 'settings_updated'
  | 'integration_connected'
  | 'integration_disconnected'
  // Billing
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'payment_processed'
  | 'invoice_created'
  // Other
  | 'custom'

export type AuditCategory =
  | 'authentication'
  | 'user_management'
  | 'team_management'
  | 'resource'
  | 'security'
  | 'settings'
  | 'billing'
  | 'api'
  | 'integration'

export type AuditSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export type AuditOutcome = 'success' | 'failure' | 'warning' | 'pending'

export interface AuditActor {
  id: string
  type: 'user' | 'system' | 'api' | 'integration' | 'anonymous'
  name?: string
  email?: string
  avatar?: string
  ip_address?: string
  user_agent?: string
  location?: {
    city?: string
    region?: string
    country?: string
    country_code?: string
  }
}

export interface AuditTarget {
  id: string
  type: string
  name?: string
  description?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: AuditAction
  category: AuditCategory
  severity: AuditSeverity
  outcome: AuditOutcome
  actor: AuditActor
  target?: AuditTarget
  resource_type?: string
  resource_id?: string
  description: string
  details?: Record<string, unknown>
  changes?: {
    field: string
    old_value?: unknown
    new_value?: unknown
  }[]
  metadata?: Record<string, unknown>
  request_id?: string
  session_id?: string
  organization_id: string
}

export interface AuditLogFilters {
  search?: string
  actions?: AuditAction[]
  categories?: AuditCategory[]
  severities?: AuditSeverity[]
  outcomes?: AuditOutcome[]
  actors?: string[]
  targets?: string[]
  dateRange?: {
    start: string
    end: string
  }
  resourceTypes?: string[]
}

export interface AuditLogStats {
  total: number
  by_category: Record<AuditCategory, number>
  by_severity: Record<AuditSeverity, number>
  by_outcome: Record<AuditOutcome, number>
  by_action: Record<string, number>
}

// ============================================================================
// Props
// ============================================================================

export interface AuditLogViewerProps {
  entries: AuditLogEntry[]
  stats?: AuditLogStats
  totalCount?: number
  currentPage?: number
  pageSize?: number
  totalPages?: number

  // Configuration
  variant?: 'full' | 'compact' | 'embedded'
  showStats?: boolean
  showFilters?: boolean
  showExport?: boolean
  showPagination?: boolean
  enableRealtime?: boolean
  defaultFilters?: AuditLogFilters

  // Callbacks
  onFilterChange?: (filters: AuditLogFilters) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRefresh?: () => Promise<void>
  onExport?: (format: 'csv' | 'json' | 'pdf', filters?: AuditLogFilters) => Promise<void>
  onEntryClick?: (entry: AuditLogEntry) => void

  // Loading states
  isLoading?: boolean
  isExporting?: boolean

  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const ACTION_CONFIG: Record<AuditAction, { label: string; icon: React.ElementType; color: string }> = {
  // Authentication
  login: { label: 'Login', icon: LogIn, color: 'text-green-600' },
  logout: { label: 'Logout', icon: LogOut, color: 'text-blue-600' },
  login_failed: { label: 'Login Failed', icon: XCircle, color: 'text-red-600' },
  password_changed: { label: 'Password Changed', icon: Key, color: 'text-yellow-600' },
  password_reset: { label: 'Password Reset', icon: Key, color: 'text-orange-600' },
  mfa_enabled: { label: 'MFA Enabled', icon: Shield, color: 'text-green-600' },
  mfa_disabled: { label: 'MFA Disabled', icon: Shield, color: 'text-orange-600' },
  mfa_verified: { label: 'MFA Verified', icon: CheckCircle2, color: 'text-green-600' },
  mfa_failed: { label: 'MFA Failed', icon: XCircle, color: 'text-red-600' },
  session_created: { label: 'Session Created', icon: Activity, color: 'text-blue-600' },
  session_revoked: { label: 'Session Revoked', icon: XCircle, color: 'text-orange-600' },
  token_generated: { label: 'Token Generated', icon: Key, color: 'text-blue-600' },
  token_revoked: { label: 'Token Revoked', icon: Key, color: 'text-red-600' },

  // User Management
  user_created: { label: 'User Created', icon: UserPlus, color: 'text-green-600' },
  user_updated: { label: 'User Updated', icon: Edit, color: 'text-blue-600' },
  user_deleted: { label: 'User Deleted', icon: UserMinus, color: 'text-red-600' },
  user_invited: { label: 'User Invited', icon: UserPlus, color: 'text-blue-600' },
  user_activated: { label: 'User Activated', icon: CheckCircle2, color: 'text-green-600' },
  user_deactivated: { label: 'User Deactivated', icon: XCircle, color: 'text-orange-600' },
  user_role_changed: { label: 'Role Changed', icon: Shield, color: 'text-purple-600' },

  // Team/Org Management
  team_created: { label: 'Team Created', icon: UserPlus, color: 'text-green-600' },
  team_updated: { label: 'Team Updated', icon: Edit, color: 'text-blue-600' },
  team_deleted: { label: 'Team Deleted', icon: Trash2, color: 'text-red-600' },
  member_added: { label: 'Member Added', icon: UserPlus, color: 'text-green-600' },
  member_removed: { label: 'Member Removed', icon: UserMinus, color: 'text-orange-600' },
  member_role_changed: { label: 'Member Role Changed', icon: Shield, color: 'text-purple-600' },

  // Resource Operations
  resource_created: { label: 'Resource Created', icon: FileText, color: 'text-green-600' },
  resource_updated: { label: 'Resource Updated', icon: Edit, color: 'text-blue-600' },
  resource_deleted: { label: 'Resource Deleted', icon: Trash2, color: 'text-red-600' },
  resource_viewed: { label: 'Resource Viewed', icon: Eye, color: 'text-gray-600' },
  resource_exported: { label: 'Resource Exported', icon: Download, color: 'text-blue-600' },
  resource_shared: { label: 'Resource Shared', icon: ExternalLink, color: 'text-purple-600' },
  resource_unshared: { label: 'Resource Unshared', icon: XCircle, color: 'text-orange-600' },

  // Security
  permission_granted: { label: 'Permission Granted', icon: CheckCircle2, color: 'text-green-600' },
  permission_revoked: { label: 'Permission Revoked', icon: XCircle, color: 'text-red-600' },
  api_key_created: { label: 'API Key Created', icon: Key, color: 'text-blue-600' },
  api_key_deleted: { label: 'API Key Deleted', icon: Key, color: 'text-red-600' },
  webhook_created: { label: 'Webhook Created', icon: Activity, color: 'text-blue-600' },
  webhook_updated: { label: 'Webhook Updated', icon: Edit, color: 'text-yellow-600' },
  webhook_deleted: { label: 'Webhook Deleted', icon: Trash2, color: 'text-red-600' },
  ip_whitelisted: { label: 'IP Whitelisted', icon: Globe, color: 'text-green-600' },
  ip_removed: { label: 'IP Removed', icon: Globe, color: 'text-red-600' },

  // Settings
  settings_updated: { label: 'Settings Updated', icon: Settings, color: 'text-blue-600' },
  integration_connected: { label: 'Integration Connected', icon: Activity, color: 'text-green-600' },
  integration_disconnected: { label: 'Integration Disconnected', icon: XCircle, color: 'text-orange-600' },

  // Billing
  subscription_created: { label: 'Subscription Created', icon: FileText, color: 'text-green-600' },
  subscription_updated: { label: 'Subscription Updated', icon: Edit, color: 'text-blue-600' },
  subscription_cancelled: { label: 'Subscription Cancelled', icon: XCircle, color: 'text-red-600' },
  payment_processed: { label: 'Payment Processed', icon: CheckCircle2, color: 'text-green-600' },
  invoice_created: { label: 'Invoice Created', icon: FileText, color: 'text-blue-600' },

  // Other
  custom: { label: 'Custom Action', icon: Activity, color: 'text-gray-600' },
}

const CATEGORY_CONFIG: Record<AuditCategory, { label: string; color: string }> = {
  authentication: { label: 'Authentication', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  user_management: { label: 'User Management', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  team_management: { label: 'Team Management', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  resource: { label: 'Resource', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  security: { label: 'Security', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  settings: { label: 'Settings', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  billing: { label: 'Billing', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  api: { label: 'API', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
  integration: { label: 'Integration', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

const SEVERITY_CONFIG: Record<AuditSeverity, { label: string; color: string; icon: React.ElementType }> = {
  info: { label: 'Info', color: 'text-gray-500', icon: Info },
  low: { label: 'Low', color: 'text-blue-500', icon: Info },
  medium: { label: 'Medium', color: 'text-yellow-500', icon: AlertTriangle },
  high: { label: 'High', color: 'text-orange-500', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'text-red-500', icon: XCircle },
}

const OUTCOME_CONFIG: Record<AuditOutcome, { label: string; color: string; icon: React.ElementType }> = {
  success: { label: 'Success', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  failure: { label: 'Failure', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertTriangle },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', icon: Clock },
}

// ============================================================================
// Helper Components
// ============================================================================

function ActionIcon({ action, className }: { action: AuditAction; className?: string }) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.custom
  const Icon = config.icon

  return <Icon className={cn('h-4 w-4', config.color, className)} />
}

function CategoryBadge({ category }: { category: AuditCategory }) {
  const config = CATEGORY_CONFIG[category]
  return (
    <Badge className={cn('font-medium text-xs', config.color)}>
      {config.label}
    </Badge>
  )
}

function SeverityIndicator({ severity }: { severity: AuditSeverity }) {
  const config = SEVERITY_CONFIG[severity]
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon className={cn('h-4 w-4', config.color)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label} Severity</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function OutcomeBadge({ outcome }: { outcome: AuditOutcome }) {
  const config = OUTCOME_CONFIG[outcome]
  const Icon = config.icon

  return (
    <Badge className={cn('font-medium text-xs gap-1', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function ActorInfo({ actor }: { actor: AuditActor }) {
  if (actor.type === 'system') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
          <Settings className="h-4 w-4 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium">System</p>
          <p className="text-xs text-muted-foreground">Automated action</p>
        </div>
      </div>
    )
  }

  if (actor.type === 'api') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
          <Key className="h-4 w-4 text-cyan-600" />
        </div>
        <div>
          <p className="text-sm font-medium">{actor.name || 'API'}</p>
          <p className="text-xs text-muted-foreground">API Request</p>
        </div>
      </div>
    )
  }

  if (actor.type === 'anonymous') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium">Anonymous</p>
          {actor.ip_address && (
            <p className="text-xs text-muted-foreground">{actor.ip_address}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={actor.avatar} />
        <AvatarFallback>
          {actor.name?.split(' ').map(n => n[0]).join('') || '?'}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{actor.name || 'Unknown'}</p>
        {actor.email && (
          <p className="text-xs text-muted-foreground">{actor.email}</p>
        )}
      </div>
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = parseISO(timestamp)

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`
  }

  return format(date, 'MMM d, yyyy h:mm a')
}

function EntryDetailDialog({ entry, open, onOpenChange }: {
  entry: AuditLogEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActionIcon action={entry.action} />
            {ACTION_CONFIG[entry.action]?.label || entry.action}
          </DialogTitle>
          <DialogDescription>
            {entry.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Timestamp</Label>
              <p className="text-sm">{format(parseISO(entry.timestamp), 'PPpp')}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Relative Time</Label>
              <p className="text-sm">{formatDistanceToNow(parseISO(entry.timestamp), { addSuffix: true })}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <div className="mt-1">
                <CategoryBadge category={entry.category} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Outcome</Label>
              <div className="mt-1">
                <OutcomeBadge outcome={entry.outcome} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actor */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Performed By</Label>
            <div className="bg-muted/50 rounded-lg p-4">
              <ActorInfo actor={entry.actor} />
              {(entry.actor.ip_address || entry.actor.location) && (
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {entry.actor.ip_address && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{entry.actor.ip_address}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => copyToClipboard(entry.actor.ip_address!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {entry.actor.location && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>
                        {[entry.actor.location.city, entry.actor.location.region, entry.actor.location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Target */}
          {entry.target && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Target Resource</Label>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{entry.target.name || entry.target.id}</span>
                    <Badge variant="outline" className="text-xs">{entry.target.type}</Badge>
                  </div>
                  {entry.target.description && (
                    <p className="text-sm text-muted-foreground mt-2">{entry.target.description}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Changes */}
          {entry.changes && entry.changes.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Changes Made</Label>
                <div className="space-y-2">
                  {entry.changes.map((change, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium">{change.field}</p>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Before: </span>
                          <span className="text-red-600 dark:text-red-400">
                            {change.old_value !== undefined ? JSON.stringify(change.old_value) : '(empty)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">After: </span>
                          <span className="text-green-600 dark:text-green-400">
                            {change.new_value !== undefined ? JSON.stringify(change.new_value) : '(empty)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional Details */}
          {entry.details && Object.keys(entry.details).length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Additional Details</Label>
                <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <Label className="text-xs text-muted-foreground">Entry ID</Label>
              <div className="flex items-center gap-1 mt-1">
                <code className="bg-muted px-1 rounded">{entry.id}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => copyToClipboard(entry.id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {entry.request_id && (
              <div>
                <Label className="text-xs text-muted-foreground">Request ID</Label>
                <div className="flex items-center gap-1 mt-1">
                  <code className="bg-muted px-1 rounded">{entry.request_id}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => copyToClipboard(entry.request_id!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            {entry.session_id && (
              <div>
                <Label className="text-xs text-muted-foreground">Session ID</Label>
                <div className="flex items-center gap-1 mt-1">
                  <code className="bg-muted px-1 rounded">{entry.session_id}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LogEntryRow({
  entry,
  isExpanded,
  onToggle,
  onClick
}: {
  entry: AuditLogEntry
  isExpanded: boolean
  onToggle: () => void
  onClick: () => void
}) {
  const actionConfig = ACTION_CONFIG[entry.action] || ACTION_CONFIG.custom

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={cn(
          'flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors',
          isExpanded && 'bg-muted/50'
        )}
        onClick={onClick}
      >
        {/* Severity Indicator */}
        <SeverityIndicator severity={entry.severity} />

        {/* Action Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          <ActionIcon action={entry.action} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{actionConfig.label}</span>
            <CategoryBadge category={entry.category} />
            <OutcomeBadge outcome={entry.outcome} />
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{entry.description}</p>
        </div>

        {/* Actor */}
        <div className="hidden md:block">
          <ActorInfo actor={entry.actor} />
        </div>

        {/* Timestamp */}
        <div className="text-right">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(entry.timestamp)}
          </p>
        </div>

        {/* Expand Toggle */}
        <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="ml-12 pl-4 border-l-2 border-muted py-2 space-y-2">
          {/* Quick details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {entry.actor.ip_address && (
              <div>
                <span className="text-muted-foreground">IP Address: </span>
                <span className="font-mono">{entry.actor.ip_address}</span>
              </div>
            )}
            {entry.actor.location && (
              <div>
                <span className="text-muted-foreground">Location: </span>
                <span>
                  {[entry.actor.location.city, entry.actor.location.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
            {entry.target && (
              <div>
                <span className="text-muted-foreground">Target: </span>
                <span>{entry.target.name || entry.target.type}</span>
              </div>
            )}
            {entry.request_id && (
              <div>
                <span className="text-muted-foreground">Request: </span>
                <span className="font-mono">{entry.request_id.substring(0, 8)}...</span>
              </div>
            )}
          </div>

          {/* Changes preview */}
          {entry.changes && entry.changes.length > 0 && (
            <div className="text-xs">
              <span className="text-muted-foreground">Changes: </span>
              <span>{entry.changes.map(c => c.field).join(', ')}</span>
            </div>
          )}

          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onClick}>
            View full details <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AuditLogViewer({
  entries,
  stats,
  totalCount,
  currentPage = 1,
  pageSize = 50,
  totalPages = 1,
  variant = 'full',
  showStats = true,
  showFilters = true,
  showExport = true,
  showPagination = true,
  enableRealtime = false,
  defaultFilters,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onExport,
  onEntryClick,
  isLoading = false,
  isExporting = false,
  className,
}: AuditLogViewerProps) {
  const [filters, setFilters] = useState<AuditLogFilters>(defaultFilters || {})
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: Partial<AuditLogFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }, [filters, onFilterChange])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
    onFilterChange?.({})
  }, [onFilterChange])

  // Toggle entry expansion
  const toggleEntry = useCallback((entryId: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev)
      if (next.has(entryId)) {
        next.delete(entryId)
      } else {
        next.add(entryId)
      }
      return next
    })
  }, [])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.actions?.length) count++
    if (filters.categories?.length) count++
    if (filters.severities?.length) count++
    if (filters.outcomes?.length) count++
    if (filters.dateRange) count++
    return count
  }, [filters])

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {entries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedEntry(entry)
                    onEntryClick?.(entry)
                  }}
                >
                  <ActionIcon action={entry.action} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(parseISO(entry.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <OutcomeBadge outcome={entry.outcome} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">
            {totalCount ? `${totalCount.toLocaleString()} total events` : 'Activity and security logs'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}

          {showExport && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('csv', filters)}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json', filters)}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('pdf', filters)}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.by_outcome.success?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.by_outcome.failure?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">High Severity</p>
              <p className="text-2xl font-bold text-orange-600">
                {((stats.by_severity.high || 0) + (stats.by_severity.critical || 0)).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Security Events</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.by_category.security?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.categories?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange({
                  categories: value === 'all' ? undefined : [value as AuditCategory]
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Outcome Filter */}
              <Select
                value={filters.outcomes?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange({
                  outcomes: value === 'all' ? undefined : [value as AuditOutcome]
                })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  {Object.entries(OUTCOME_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* More Filters */}
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ListFilter className="h-4 w-4 mr-2" />
                    More Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear all
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Severity */}
                    <div className="space-y-2">
                      <Label className="text-sm">Severity</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`severity-${key}`}
                              checked={filters.severities?.includes(key as AuditSeverity)}
                              onCheckedChange={(checked) => {
                                const current = filters.severities || []
                                handleFilterChange({
                                  severities: checked
                                    ? [...current, key as AuditSeverity]
                                    : current.filter(s => s !== key)
                                })
                              }}
                            />
                            <label
                              htmlFor={`severity-${key}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {config.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label className="text-sm">Date Range</Label>
                      <Select
                        value={filters.dateRange ? 'custom' : 'all'}
                        onValueChange={(value) => {
                          if (value === 'all') {
                            handleFilterChange({ dateRange: undefined })
                          } else {
                            const now = new Date()
                            const start = new Date()

                            switch (value) {
                              case '1h':
                                start.setHours(now.getHours() - 1)
                                break
                              case '24h':
                                start.setDate(now.getDate() - 1)
                                break
                              case '7d':
                                start.setDate(now.getDate() - 7)
                                break
                              case '30d':
                                start.setDate(now.getDate() - 30)
                                break
                            }

                            handleFilterChange({
                              dateRange: {
                                start: start.toISOString(),
                                end: now.toISOString(),
                              }
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="1h">Last Hour</SelectItem>
                          <SelectItem value="24h">Last 24 Hours</SelectItem>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Entries */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No logs found</h3>
              <p className="text-muted-foreground">
                {activeFiltersCount > 0
                  ? 'Try adjusting your filters'
                  : 'Activity logs will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => (
                <LogEntryRow
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedEntries.has(entry.id)}
                  onToggle={() => toggleEntry(entry.id)}
                  onClick={() => {
                    setSelectedEntry(entry)
                    onEntryClick?.(entry)
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange?.(1)}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange?.(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange?.(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange?.(totalPages)}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Entry Detail Dialog */}
      {selectedEntry && (
        <EntryDetailDialog
          entry={selectedEntry}
          open={!!selectedEntry}
          onOpenChange={(open) => !open && setSelectedEntry(null)}
        />
      )}
    </div>
  )
}

export default AuditLogViewer
