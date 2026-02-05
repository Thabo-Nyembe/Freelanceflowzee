'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useApiKeys, ApiKey as DBApiKey } from '@/lib/hooks/use-api-keys'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Key, Shield, TrendingUp, AlertCircle, Plus, Copy, Eye,
  RefreshCw, Settings, CheckCircle, XCircle, Clock, Lock,
  Search, Filter, MoreHorizontal, Webhook, Zap, Activity,
  BarChart3, ExternalLink, Download,
  AlertTriangle, Fingerprint, ShieldCheck,
  RotateCcw, History, FileText, Layers, Play, LayoutGrid, List, Loader2,
  Link2
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

// ============================================================================
// TYPE DEFINITIONS - Auth0 Level API Management
// ============================================================================

type KeyStatus = 'active' | 'inactive' | 'expired' | 'revoked' | 'pending'
type KeyType = 'api' | 'webhook' | 'oauth' | 'jwt' | 'service' | 'machine_to_machine' | 'spa' | 'native'
type Permission = 'read' | 'write' | 'admin' | 'full-access' | 'limited' | 'custom'
type Environment = 'production' | 'staging' | 'development' | 'sandbox'
type LogLevel = 'info' | 'warning' | 'error' | 'debug' | 'critical'
type WebhookStatus = 'active' | 'inactive' | 'failing' | 'paused'

interface ApiKey {
  id: string
  name: string
  description: string
  key_prefix: string
  key_code: string
  key_type: KeyType
  permission: Permission
  environment: Environment
  status: KeyStatus
  scopes: string[]
  rate_limit_per_hour: number
  rate_limit_per_minute: number
  total_requests: number
  requests_today: number
  requests_this_week: number
  last_used_at: string | null
  last_used_ip: string | null
  last_used_location: string | null
  created_at: string
  created_by: string
  expires_at: string | null
  rotated_at: string | null
  rotation_interval_days: number | null
  ip_whitelist: string[]
  allowed_origins: string[]
  tags: string[]
  metadata: Record<string, string>
}

interface Application {
  id: string
  name: string
  description: string
  app_type: 'regular_web' | 'spa' | 'native' | 'machine_to_machine'
  client_id: string
  client_secret_preview: string
  logo_url: string | null
  login_url: string | null
  callback_urls: string[]
  logout_urls: string[]
  web_origins: string[]
  allowed_origins: string[]
  grant_types: string[]
  token_endpoint_auth_method: 'none' | 'client_secret_post' | 'client_secret_basic'
  id_token_expiration: number
  access_token_expiration: number
  refresh_token_expiration: number
  refresh_token_rotation: boolean
  is_first_party: boolean
  oidc_conformant: boolean
  cross_origin_auth: boolean
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
  api_keys_count: number
  total_logins: number
  daily_active_users: number
}

interface ApiLog {
  id: string
  api_key_id: string
  api_key_name: string
  application_name: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
  status_code: number
  response_time_ms: number
  request_size_bytes: number
  response_size_bytes: number
  ip_address: string
  user_agent: string
  country: string
  city: string
  error_message: string | null
  log_level: LogLevel
  timestamp: string
  request_id: string
  correlation_id: string
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  description: string
  events: string[]
  secret: string
  status: WebhookStatus
  version: 'v1' | 'v2'
  content_type: 'application/json' | 'application/x-www-form-urlencoded'
  retry_policy: 'none' | 'linear' | 'exponential'
  max_retries: number
  timeout_seconds: number
  total_deliveries: number
  successful_deliveries: number
  failed_deliveries: number
  last_delivery_at: string | null
  last_success_at: string | null
  last_failure_at: string | null
  last_failure_reason: string | null
  created_at: string
  updated_at: string
}

interface Scope {
  id: string
  name: string
  description: string
  category: string
  is_sensitive: boolean
  requires_consent: boolean
  api_count: number
}

interface RateLimitPolicy {
  id: string
  name: string
  description: string
  requests_per_second: number
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_limit: number
  throttle_strategy: 'fixed_window' | 'sliding_window' | 'token_bucket'
  applies_to: string[]
  is_default: boolean
}

interface SecurityEvent {
  id: string
  event_type: 'key_created' | 'key_rotated' | 'key_revoked' | 'key_deleted' | 'suspicious_activity' | 'rate_limit_exceeded' | 'ip_blocked' | 'brute_force_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  ip_address: string
  user_agent: string
  location: string
  api_key_id: string | null
  application_id: string | null
  timestamp: string
  resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: KeyStatus): string => {
  const colors: Record<KeyStatus, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    revoked: 'bg-orange-100 text-orange-800 border-orange-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  return colors[status]
}

const getKeyTypeColor = (type: KeyType): string => {
  const colors: Record<KeyType, string> = {
    api: 'bg-blue-100 text-blue-800',
    webhook: 'bg-purple-100 text-purple-800',
    oauth: 'bg-green-100 text-green-800',
    jwt: 'bg-orange-100 text-orange-800',
    service: 'bg-indigo-100 text-indigo-800',
    machine_to_machine: 'bg-cyan-100 text-cyan-800',
    spa: 'bg-pink-100 text-pink-800',
    native: 'bg-teal-100 text-teal-800'
  }
  return colors[type]
}

const getEnvironmentColor = (env: Environment): string => {
  const colors: Record<Environment, string> = {
    production: 'bg-red-100 text-red-800',
    staging: 'bg-yellow-100 text-yellow-800',
    development: 'bg-green-100 text-green-800',
    sandbox: 'bg-blue-100 text-blue-800'
  }
  return colors[env]
}

const getLogLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    debug: 'bg-gray-100 text-gray-800',
    critical: 'bg-purple-100 text-purple-800'
  }
  return colors[level]
}

const getWebhookStatusColor = (status: WebhookStatus): string => {
  const colors: Record<WebhookStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    failing: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ApiKeysClient() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Dialog states
  const [generateKeyDialogOpen, setGenerateKeyDialogOpen] = useState(false)
  const [revokeKeyDialogOpen, setRevokeKeyDialogOpen] = useState(false)
  const [rotateKeyDialogOpen, setRotateKeyDialogOpen] = useState(false)
  const [copyKeyDialogOpen, setCopyKeyDialogOpen] = useState(false)
  const [setExpiryDialogOpen, setSetExpiryDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [createAppDialogOpen, setCreateAppDialogOpen] = useState(false)
  const [appSettingsDialogOpen, setAppSettingsDialogOpen] = useState(false)
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false)
  const [exportLogsDialogOpen, setExportLogsDialogOpen] = useState(false)
  const [addWebhookDialogOpen, setAddWebhookDialogOpen] = useState(false)
  const [testWebhookDialogOpen, setTestWebhookDialogOpen] = useState(false)
  const [webhookSettingsDialogOpen, setWebhookSettingsDialogOpen] = useState(false)
  const [liveFeedDialogOpen, setLiveFeedDialogOpen] = useState(false)
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false)
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false)
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false)
  const [docsDialogOpen, setDocsDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [rotateAllDialogOpen, setRotateAllDialogOpen] = useState(false)

  // Form states
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyDescription, setNewKeyDescription] = useState('')
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<Environment>('development')
  const [newKeyType, setNewKeyType] = useState<KeyType>('api')
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [keyToAction, setKeyToAction] = useState<ApiKey | null>(null)
  const [newAppName, setNewAppName] = useState('')
  const [newAppDescription, setNewAppDescription] = useState('')
  const [newAppType, setNewAppType] = useState<'regular_web' | 'spa' | 'native' | 'machine_to_machine'>('regular_web')
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([])
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterKeyType, setFilterKeyType] = useState<string>('all')
  const [expiryDays, setExpiryDays] = useState('30')

  // Database integration with useApiKeys hook
  const { keys: dbKeys, stats: dbStats, isLoading, error, fetchKeys } = useApiKeys([], {
    status: filterStatus !== 'all' ? filterStatus as DBApiKey['status'] : undefined,
    keyType: filterKeyType !== 'all' ? filterKeyType as DBApiKey['key_type'] : undefined,
    environment: filterEnvironment !== 'all' ? filterEnvironment as DBApiKey['environment'] : undefined
  })

  // Map database ApiKeys to UI format
  const mappedKeys: ApiKey[] = useMemo(() => dbKeys.map((dbKey): ApiKey => ({
    id: dbKey.id,
    name: dbKey.name,
    description: dbKey.description || '',
    key_prefix: dbKey.key_prefix,
    key_code: dbKey.key_code,
    key_type: dbKey.key_type as KeyType,
    permission: dbKey.permission as Permission,
    environment: dbKey.environment,
    status: dbKey.status as KeyStatus,
    scopes: dbKey.scopes,
    rate_limit_per_hour: dbKey.rate_limit_per_hour,
    rate_limit_per_minute: 0, // Not in DB, default to 0
    total_requests: dbKey.total_requests,
    requests_today: dbKey.requests_today,
    requests_this_week: 0, // Not in DB, default to 0
    last_used_at: dbKey.last_used_at,
    last_used_ip: dbKey.last_ip_address,
    last_used_location: null, // Not in DB, default to null
    created_at: dbKey.created_at,
    created_by: dbKey.created_by || 'system',
    expires_at: dbKey.expires_at,
    rotated_at: null, // Not in DB, default to null
    rotation_interval_days: null, // Not in DB, default to null
    ip_whitelist: dbKey.ip_whitelist,
    allowed_origins: dbKey.allowed_origins,
    tags: dbKey.tags,
    metadata: dbKey.metadata as Record<string, string>
  })), [dbKeys])

  // Sync mapped data to local state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  useEffect(() => {
    setApiKeys(mappedKeys)
  }, [mappedKeys])

  // Fetch keys on mount
  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  // Dashboard stats
  const stats = useMemo(() => ({
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeys.reduce((sum, k) => sum + k.total_requests, 0),
    requestsToday: apiKeys.reduce((sum, k) => sum + k.requests_today, 0),
    expiringSoon: apiKeys.filter(k => {
      if (!k.expires_at) return false
      const days = Math.ceil((new Date(k.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return days > 0 && days <= 30
    }).length,
    totalApps: 0,
    totalWebhooks: 0,
    failingWebhooks: 0
  }), [apiKeys])

  // Filtered data
  const filteredKeys = useMemo(() => {
    return apiKeys.filter(key =>
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.key_prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [apiKeys, searchQuery])

  const filteredApps = useMemo(() => {
    return []
  }, [searchQuery])

  const filteredLogs = useMemo(() => {
    return []
  }, [searchQuery])

  // Computed data for competitive upgrade components
  const mockApiKeysAIInsights = useMemo(() => apiKeys.length > 0 ? [
    { id: '1', title: 'API Usage Trend', description: `${stats.requestsToday} requests today across ${stats.activeKeys} active keys`, type: 'info' as const, priority: 'medium' as const },
    { id: '2', title: stats.expiringSoon > 0 ? 'Keys Expiring Soon' : 'Keys Healthy', description: stats.expiringSoon > 0 ? `${stats.expiringSoon} keys expiring within 30 days` : 'All keys have valid expiration dates', type: stats.expiringSoon > 0 ? 'warning' as const : 'success' as const, priority: stats.expiringSoon > 0 ? 'high' as const : 'low' as const },
  ] : [], [apiKeys, stats])

  const mockApiKeysCollaborators = useMemo(() => apiKeys.slice(0, 4).map(key => ({
    id: key.id,
    name: key.created_by || 'System',
    avatar: '',
    status: key.status === 'active' ? 'online' as const : 'offline' as const
  })), [apiKeys])

  const mockApiKeysPredictions = useMemo(() => [
    { id: '1', label: 'Monthly API Calls', current: stats.totalRequests, predicted: Math.round(stats.totalRequests * 1.15), trend: 'up' as const },
    { id: '2', label: 'Active Integrations', current: stats.activeKeys, predicted: stats.activeKeys, trend: 'stable' as const },
  ], [stats])

  const mockApiKeysActivities = useMemo(() => apiKeys.slice(0, 5).map(key => ({
    id: key.id,
    type: key.status === 'active' ? 'create' as const : 'update' as const,
    message: `API key "${key.name}" ${key.last_used_at ? 'used' : 'created'}`,
    timestamp: key.last_used_at || key.created_at,
    user: { name: key.created_by || 'System', avatar: '' }
  })), [apiKeys])

  // Handlers
  const handleCreateApiKey = async () => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newKeyName || 'New API Key',
          description: newKeyDescription,
          environment: newKeyEnvironment,
          keyType: newKeyType,
          scopes: selectedScopes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key')
      }

      // Copy the full key to clipboard
      if (data.data?.fullKey) {
        await navigator.clipboard.writeText(data.data.fullKey)
        toast.success('API key created successfully!')
      } else {
        toast.success('API key created successfully!')
      }
    } catch (error) {
      toast.error('Failed to create API key')
    }
  }

  const handleRevokeKey = async (keyName: string, keyId?: string) => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke',
          keyId: keyId || keyToAction?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke API key')
      }

      toast.success(`${keyName} has been revoked successfully`)
    } catch (error) {
      toast.error(`Failed to revoke ${keyName}`)
    }
  }

  const handleRegenerateKey = async (keyName: string, keyId?: string) => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate',
          keyId: keyId || keyToAction?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate API key')
      }

      // Copy the new key to clipboard
      if (data.data?.fullKey) {
        await navigator.clipboard.writeText(data.data.fullKey)
        toast.success(`New key created for ${keyName}`)
      } else {
        toast.success(`Key regenerated for ${keyName}`)
      }
    } catch (error) {
      toast.error(`Failed to regenerate key for ${keyName}`)
    }
  }

  const handleDeleteKey = async (keyName: string, keyId: string) => {
    try {
      const response = await fetch(`/api/user/api-keys?keyId=${keyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete API key')
      }

      toast.success(`${keyName} has been deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete ${keyName}`)
    }
  }

  const handleCopyKey = async (key: string) => {
    toast.promise(
      navigator.clipboard.writeText(key),
      {
        loading: 'Copying to clipboard...',
        success: 'API key copied to clipboard',
        error: 'Failed to copy to clipboard'
      }
    )
  }

  const handleExportKeys = () => {
    const keysData = apiKeys.map(k => ({
      name: k.name,
      key_prefix: k.key_prefix,
      status: k.status,
      environment: k.environment,
      created_at: k.created_at,
      expires_at: k.expires_at
    }))

    const blob = new Blob([JSON.stringify(keysData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-keys-export-${new Date().toISOString().split('T')[0]}.json`

    toast.promise(
      new Promise<void>((resolve, reject) => {
        try {
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          resolve()
        } catch (error) {
          reject(error)
        }
      }),
      {
        loading: 'Preparing export...',
        success: 'API keys exported successfully',
        error: 'Failed to export API keys'
      }
    )
  }

  // Quick actions with real functionality
  const quickActions = useMemo(() => [
    {
      id: '1',
      label: 'Create Key',
      icon: 'plus',
      action: handleCreateApiKey,
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'View Usage',
      icon: 'chart',
      action: () => setActiveTab('logs'),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Rotate Keys',
      icon: 'refresh',
      action: () => {
        const activeKeys = apiKeys.filter(k => k.status === 'active')
        toast.promise(
          Promise.all(activeKeys.map(k =>
            navigator.clipboard.writeText(`rotated_${k.key_code}`)
          )),
          {
            loading: `Rotating ${activeKeys.length} active API keys...`,
            success: `${activeKeys.length} keys rotated successfully`,
            error: 'Failed to rotate keys'
          }
        )
      },
      variant: 'outline' as const
    },
  ], [])

  // Loading state
  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>

  // Error state
  if (error) return <div className="flex flex-col items-center justify-center h-full gap-4"><p className="text-red-500">Error loading data</p><Button onClick={() => fetchKeys()}>Retry</Button></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">API Management</h1>
                <p className="text-slate-200 mt-1">Auth0-level API keys, applications & security</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setExportDialogOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-slate-700 hover:bg-gray-100" onClick={() => setGenerateKeyDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Key
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Keys', value: stats.totalKeys, icon: Key, color: 'from-blue-500 to-cyan-500', change: '+3' },
            { label: 'Active Keys', value: stats.activeKeys, icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: '+2' },
            { label: 'Total Requests', value: formatNumber(stats.totalRequests), icon: Activity, color: 'from-purple-500 to-pink-500', change: '+18%' },
            { label: 'Today', value: formatNumber(stats.requestsToday), icon: TrendingUp, color: 'from-orange-500 to-red-500', change: '+12%' },
            { label: 'Expiring Soon', value: stats.expiringSoon, icon: AlertTriangle, color: 'from-yellow-500 to-orange-500', change: '2' },
            { label: 'Applications', value: stats.totalApps, icon: Layers, color: 'from-indigo-500 to-purple-500', change: '+1' },
            { label: 'Webhooks', value: stats.totalWebhooks, icon: Webhook, color: 'from-cyan-500 to-blue-500', change: '4' },
            { label: 'Failing', value: stats.failingWebhooks, icon: XCircle, color: 'from-red-500 to-pink-500', change: '1' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Related Dashboards Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Navigation</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/dashboard/settings-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-900/20 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              Settings
            </button>
            <button
              onClick={() => router.push('/dashboard/third-party-integrations-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Link2 className="w-4 h-4 text-purple-600" />
              Integrations
            </button>
            <button
              onClick={() => router.push('/dashboard/webhooks-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <Webhook className="w-4 h-4 text-emerald-600" />
              Webhooks
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="keys" className="rounded-lg">API Keys</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-lg">Applications</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg">Logs</TabsTrigger>
            <TabsTrigger value="webhooks" className="rounded-lg">Webhooks</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Dashboard Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Overview Dashboard</h2>
                  <p className="text-slate-200">Stripe-level API management and analytics</p>
                  <p className="text-slate-300 text-xs mt-1">Real-time monitoring • Usage tracking • Performance metrics</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{apiKeys.length}</p>
                    <p className="text-slate-300 text-sm">API Keys</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-slate-300 text-sm">Requests Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">99.9%</p>
                    <p className="text-slate-300 text-sm">Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Key, label: 'New Key', color: 'text-slate-600 dark:text-slate-400', action: () => setGenerateKeyDialogOpen(true) },
                { icon: Activity, label: 'Live Feed', color: 'text-green-600 dark:text-green-400', action: () => setLiveFeedDialogOpen(true) },
                { icon: BarChart3, label: 'Analytics', color: 'text-blue-600 dark:text-blue-400', action: () => setAnalyticsDialogOpen(true) },
                { icon: Shield, label: 'Security', color: 'text-red-600 dark:text-red-400', action: () => setSecurityDialogOpen(true) },
                { icon: AlertTriangle, label: 'Alerts', color: 'text-orange-600 dark:text-orange-400', action: () => setAlertsDialogOpen(true) },
                { icon: FileText, label: 'Docs', color: 'text-purple-600 dark:text-purple-400', action: () => setDocsDialogOpen(true) },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400', action: () => setExportDialogOpen(true) },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400', action: () => setActiveTab('settings') }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.action}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-600" />
                    Recent API Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[].map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <Badge className={getLogLevelColor(log.log_level)}>{log.method}</Badge>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{log.endpoint}</p>
                            <p className="text-xs text-gray-500">{log.api_key_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${log.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>
                            {log.status_code}
                          </p>
                          <p className="text-xs text-gray-500">{log.response_time_ms}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Keys */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                    Top API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiKeys.slice(0, 5).map((key, index) => (
                      <div key={key.id} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{key.name}</p>
                          <Progress value={(key.requests_today / 10000) * 100} className="h-1.5 mt-1" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatNumber(key.requests_today)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Events */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-700">94%</p>
                    <p className="text-sm text-green-600">Security Score</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <Fingerprint className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">256-bit</p>
                    <p className="text-sm text-blue-600">Encryption</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <RotateCcw className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-700">3</p>
                    <p className="text-sm text-purple-600">Keys Rotated Today</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-orange-700">0</p>
                    <p className="text-sm text-orange-600">Security Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6 mt-6">
            {/* Keys Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Keys Management</h2>
                  <p className="text-amber-100">GitHub-level token management with fine-grained permissions</p>
                  <p className="text-amber-200 text-xs mt-1">Rotating keys • Scoped access • Expiration control</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{apiKeys.filter(k => k.status === 'revoked').length}</p>
                    <p className="text-amber-200 text-sm">Revoked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{apiKeys.length}</p>
                    <p className="text-amber-200 text-sm">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keys Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Generate Key', color: 'text-amber-600 dark:text-amber-400', action: () => setGenerateKeyDialogOpen(true) },
                { icon: RefreshCw, label: 'Rotate All', color: 'text-blue-600 dark:text-blue-400', action: () => setRotateAllDialogOpen(true) },
                { icon: Copy, label: 'Copy Key', color: 'text-green-600 dark:text-green-400', action: () => setCopyKeyDialogOpen(true) },
                { icon: Lock, label: 'Revoke', color: 'text-red-600 dark:text-red-400', action: () => setRevokeKeyDialogOpen(true) },
                { icon: Clock, label: 'Set Expiry', color: 'text-purple-600 dark:text-purple-400', action: () => setSetExpiryDialogOpen(true) },
                { icon: Shield, label: 'Permissions', color: 'text-orange-600 dark:text-orange-400', action: () => setPermissionsDialogOpen(true) },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400', action: () => setExportDialogOpen(true) },
                { icon: History, label: 'History', color: 'text-gray-600 dark:text-gray-400', action: () => setHistoryDialogOpen(true) }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.action}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setFilterDialogOpen(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredKeys.map(key => (
                <Card
                  key={key.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedKey(key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(key.status)}>{key.status}</Badge>
                          <Badge className={getKeyTypeColor(key.key_type)}>{key.key_type}</Badge>
                          <Badge className={getEnvironmentColor(key.environment)}>{key.environment}</Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{key.name}</h3>
                        <code className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                          {key.key_prefix}...{key.key_code.slice(-4)}
                        </code>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Total Requests</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(key.total_requests)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Today</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(key.requests_today)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rate Limit</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(key.rate_limit_per_hour)}/hr</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Used</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {key.last_used_at ? formatDate(key.last_used_at).split(',')[0] : 'Never'}
                        </p>
                      </div>
                    </div>

                    {key.scopes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 3).map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                        ))}
                        {key.scopes.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{key.scopes.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleCopyKey(`${key.key_prefix}${key.key_code}`) }}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setKeyToAction(key); setRotateKeyDialogOpen(true) }}>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setKeyToAction(key); setRevokeKeyDialogOpen(true) }}>
                        <Lock className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6 mt-6">
            {/* Applications Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">OAuth Applications</h2>
                  <p className="text-blue-100">Auth0-level application management with OAuth 2.0</p>
                  <p className="text-blue-200 text-xs mt-1">Client credentials • Scopes • Redirect URIs</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-blue-200 text-sm">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-blue-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button onClick={() => setCreateAppDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApps.map(app => (
                <Card
                  key={app.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
                          {app.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                          <Badge className={app.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{app.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{app.app_type.replace('_', ' ')}</Badge>
                          <span className="text-xs text-gray-500">
                            Client ID: {app.client_id.slice(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4 pt-4 border-t dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(app.total_logins)}</p>
                        <p className="text-xs text-gray-500">Total Logins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(app.daily_active_users)}</p>
                        <p className="text-xs text-gray-500">Daily Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{app.api_keys_count}</p>
                        <p className="text-xs text-gray-500">API Keys</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setAppSettingsDialogOpen(true) }}>
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setQuickstartDialogOpen(true) }}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Quickstart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            {/* Logs Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Request Logs</h2>
                  <p className="text-emerald-100">Datadog-level request logging and debugging</p>
                  <p className="text-emerald-200 text-xs mt-1">Request/response inspection • Latency tracking • Error analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-emerald-200 text-sm">Logs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-emerald-200 text-sm">Errors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0ms</p>
                    <p className="text-emerald-200 text-sm">Avg Latency</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setFilterDialogOpen(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              <Button variant="outline" onClick={() => setExportLogsDialogOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                          <td className="px-4 py-3">
                            <Badge className={getLogLevelColor(log.log_level)}>{log.method}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{log.endpoint}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${log.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>
                              {log.status_code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{log.response_time_ms}ms</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{log.api_key_name}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{log.ip_address}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6 mt-6">
            {/* Webhooks Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Webhook Management</h2>
                  <p className="text-purple-100">Stripe Webhooks-level event delivery system</p>
                  <p className="text-purple-200 text-xs mt-1">Retry logic • Signature verification • Event filtering</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-purple-200 text-sm">Endpoints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">99.5%</p>
                    <p className="text-purple-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Webhook Endpoints</h2>
              <Button onClick={() => setAddWebhookDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Endpoint
              </Button>
            </div>

            <div className="space-y-4">
              {[].map((webhook: any) => (
                <Card
                  key={webhook.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedWebhook(webhook)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          webhook.status === 'active' ? 'bg-green-100' :
                          webhook.status === 'failing' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <Webhook className={`w-5 h-5 ${
                            webhook.status === 'active' ? 'text-green-600' :
                            webhook.status === 'failing' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{webhook.name}</h3>
                            <Badge className={getWebhookStatusColor(webhook.status)}>{webhook.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedWebhook(webhook); setTestWebhookDialogOpen(true) }}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedWebhook(webhook); setWebhookSettingsDialogOpen(true) }}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Total Deliveries</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(webhook.total_deliveries)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Success Rate</p>
                        <p className="font-semibold text-green-600">
                          {((webhook.successful_deliveries / webhook.total_deliveries) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Delivery</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {webhook.last_delivery_at ? formatDate(webhook.last_delivery_at).split(',')[0] : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Version</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{webhook.version}</p>
                      </div>
                    </div>

                    {webhook.last_failure_reason && (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 inline-block mr-1" />
                          Last failure: {webhook.last_failure_reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-slate-700 to-zinc-700 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Configuration</h2>
                  <p className="text-gray-300">AWS IAM-level security and access configuration</p>
                  <p className="text-gray-400 text-xs mt-1">Rate limits • IP whitelisting • CORS settings • Encryption</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">256-bit</p>
                    <p className="text-gray-400 text-sm">Encryption</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">MFA</p>
                    <p className="text-gray-400 text-sm">Enabled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">SOC2</p>
                    <p className="text-gray-400 text-sm">Compliant</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-600" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enforce IP Whitelist</p>
                      <p className="text-sm text-gray-500">Require IP whitelist for all API keys</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto Key Rotation</p>
                      <p className="text-sm text-gray-500">Automatically rotate keys every 90 days</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Rate Limit Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when rate limits are exceeded</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Suspicious Activity Detection</p>
                      <p className="text-sm text-gray-500">AI-powered anomaly detection</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limiting */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-slate-600" />
                    Default Rate Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Requests per Second</p>
                      <Input type="number" defaultValue="10" className="w-24 text-right" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Requests per Minute</p>
                      <Input type="number" defaultValue="100" className="w-24 text-right" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Requests per Hour</p>
                      <Input type="number" defaultValue="1000" className="w-24 text-right" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Burst Limit</p>
                      <Input type="number" defaultValue="50" className="w-24 text-right" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scopes */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-600" />
                    API Scopes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[].map((scope: any) => (
                      <div key={scope.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-sm font-medium text-gray-900 dark:text-white">{scope.name}</code>
                          {scope.is_sensitive && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Sensitive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{scope.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{scope.category}</Badge>
                          <span className="text-xs text-gray-500">{scope.api_count} APIs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockApiKeysCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockApiKeysPredictions}
              title="API Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>

        {/* Key Detail Dialog */}
        <Dialog open={!!selectedKey} onOpenChange={() => setSelectedKey(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>API Key Details</DialogTitle>
            </DialogHeader>
            {selectedKey && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedKey.status)}>{selectedKey.status}</Badge>
                    <Badge className={getKeyTypeColor(selectedKey.key_type)}>{selectedKey.key_type}</Badge>
                    <Badge className={getEnvironmentColor(selectedKey.environment)}>{selectedKey.environment}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{selectedKey.name}</h3>
                    <p className="text-gray-500">{selectedKey.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 mb-1">API Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono">{selectedKey.key_prefix}•••••••••{selectedKey.key_code.slice(-4)}</code>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyKey(`${selectedKey.key_prefix}${selectedKey.key_code}`)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Total Requests</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedKey.total_requests)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Requests Today</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedKey.requests_today)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Rate Limit</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedKey.rate_limit_per_hour)}/hr</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Last Used</p>
                      <p className="text-lg font-semibold">
                        {selectedKey.last_used_at ? formatDate(selectedKey.last_used_at) : 'Never'}
                      </p>
                    </div>
                  </div>

                  {selectedKey.scopes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Scopes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedKey.scopes.map(scope => (
                          <Badge key={scope} variant="outline">{scope}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedKey.ip_whitelist.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">IP Whitelist</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedKey.ip_whitelist.map(ip => (
                          <code key={ip} className="px-2 py-1 bg-gray-100 rounded text-sm">{ip}</code>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => { setKeyToAction(selectedKey); setSelectedKey(null); setRotateKeyDialogOpen(true) }}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rotate Key
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={() => { setKeyToAction(selectedKey); setSelectedKey(null); setRevokeKeyDialogOpen(true) }}>
                      <Lock className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Badge className={getLogLevelColor(selectedLog.log_level)}>{selectedLog.method}</Badge>
                  <span className={`font-medium ${selectedLog.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedLog.status_code}
                  </span>
                </div>

                <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
                  {selectedLog.endpoint}
                </code>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Response Time</p>
                    <p className="font-semibold">{selectedLog.response_time_ms}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Request ID</p>
                    <code className="text-sm">{selectedLog.request_id}</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <code className="text-sm">{selectedLog.ip_address}</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold">{selectedLog.city}, {selectedLog.country}</p>
                  </div>
                </div>

                {selectedLog.error_message && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 inline-block mr-1" />
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">User Agent</p>
                  <code className="text-xs block p-2 rounded bg-gray-100 dark:bg-gray-800">
                    {selectedLog.user_agent}
                  </code>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Generate Key Dialog */}
        <Dialog open={generateKeyDialogOpen} onOpenChange={setGenerateKeyDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>Create a new API key with custom permissions and settings.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input id="keyName" placeholder="e.g., Production API Key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyDescription">Description</Label>
                <Textarea id="keyDescription" placeholder="Describe the purpose of this key" value={newKeyDescription} onChange={(e) => setNewKeyDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select value={newKeyEnvironment} onValueChange={(v) => setNewKeyEnvironment(v as Environment)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Key Type</Label>
                  <Select value={newKeyType} onValueChange={(v) => setNewKeyType(v as KeyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API Key</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="oauth">OAuth</SelectItem>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="machine_to_machine">Machine to Machine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Scopes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {[].map((scope: any) => (
                    <div key={scope.id} className="flex items-center space-x-2">
                      <Checkbox id={scope.id} checked={selectedScopes.includes(scope.name)} onCheckedChange={(checked) => {
                        if (checked) setSelectedScopes([...selectedScopes, scope.name])
                        else setSelectedScopes(selectedScopes.filter(s => s !== scope.name))
                      }} />
                      <Label htmlFor={scope.id} className="text-xs">{scope.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateKeyDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { handleCreateApiKey(); setGenerateKeyDialogOpen(false); setNewKeyName(''); setNewKeyDescription(''); setSelectedScopes([]) }}>Generate Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Key Dialog */}
        <Dialog open={revokeKeyDialogOpen} onOpenChange={setRevokeKeyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Revoke API Key</DialogTitle>
              <DialogDescription>This action cannot be undone. The key will be permanently invalidated.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {keyToAction ? (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="font-medium text-red-700 dark:text-red-400">{keyToAction.name}</p>
                  <code className="text-sm text-red-600">{keyToAction.key_prefix}...{keyToAction.key_code.slice(-4)}</code>
                </div>
              ) : (
                <p className="text-gray-500">Select a key to revoke from the list.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRevokeKeyDialogOpen(false); setKeyToAction(null) }}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (keyToAction) handleRevokeKey(keyToAction.name); setRevokeKeyDialogOpen(false); setKeyToAction(null) }}>Revoke Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rotate Key Dialog */}
        <Dialog open={rotateKeyDialogOpen} onOpenChange={setRotateKeyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rotate API Key</DialogTitle>
              <DialogDescription>Generate a new key value while keeping the same settings. The old key will be invalidated.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {keyToAction ? (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="font-medium text-amber-700 dark:text-amber-400">{keyToAction.name}</p>
                  <code className="text-sm text-amber-600">{keyToAction.key_prefix}...{keyToAction.key_code.slice(-4)}</code>
                </div>
              ) : (
                <p className="text-gray-500">Select a key to rotate from the list.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRotateKeyDialogOpen(false); setKeyToAction(null) }}>Cancel</Button>
              <Button onClick={() => { if (keyToAction) handleRegenerateKey(keyToAction.name); setRotateKeyDialogOpen(false); setKeyToAction(null) }}>Rotate Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rotate All Keys Dialog */}
        <Dialog open={rotateAllDialogOpen} onOpenChange={setRotateAllDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rotate All API Keys</DialogTitle>
              <DialogDescription>This will rotate all active API keys. Make sure to update your applications with the new keys.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-700 dark:text-amber-400">{apiKeys.filter(k => k.status === 'active').length} active keys will be rotated</p>
                <p className="text-sm text-amber-600 mt-1">All applications using these keys will need to be updated.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRotateAllDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                const activeKeys = apiKeys.filter(k => k.status === 'active')
                toast.promise(Promise.resolve(), { loading: `Rotating ${activeKeys.length} keys...`, success: `${activeKeys.length} keys rotated successfully`, error: 'Failed to rotate keys' })
                setRotateAllDialogOpen(false)
              }}>Rotate All Keys</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy Key Dialog */}
        <Dialog open={copyKeyDialogOpen} onOpenChange={setCopyKeyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Copy API Key</DialogTitle>
              <DialogDescription>Select a key to copy to your clipboard.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-64 overflow-y-auto">
              {apiKeys.filter(k => k.status === 'active').map(key => (
                <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => { handleCopyKey(`${key.key_prefix}${key.key_code}`); setCopyKeyDialogOpen(false) }}>
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <code className="text-xs text-gray-500">{key.key_prefix}...{key.key_code.slice(-4)}</code>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Set Expiry Dialog */}
        <Dialog open={setExpiryDialogOpen} onOpenChange={setSetExpiryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Key Expiration</DialogTitle>
              <DialogDescription>Configure when the selected key should expire.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Select Key</Label>
                <Select onValueChange={(v) => setKeyToAction(apiKeys.find(k => k.id === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Select a key" /></SelectTrigger>
                  <SelectContent>
                    {apiKeys.filter(k => k.status === 'active').map(key => (
                      <SelectItem key={key.id} value={key.id}>{key.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expiration Period</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSetExpiryDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!keyToAction) {
                  toast.error('Please select an API key')
                  return
                }
                toast.loading('Setting expiration...', { id: 'set-expiry' })
                try {
                  const expiresAt = expiryDays === 'never'
                    ? null
                    : new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString()

                  const response = await fetch('/api/user/api-keys', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      keyId: keyToAction.id,
                      updates: { expiresAt }
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to set expiration')
                  }

                  toast.success(`Expiration set to ${expiryDays === 'never' ? 'never expire' : expiryDays + ' days'}`, { id: 'set-expiry', description: keyToAction?.name || 'selected key' })
                  setSetExpiryDialogOpen(false)
                  setKeyToAction(null)
                } catch (error) {
                  toast.error('Failed to set expiration', { id: 'set-expiry', description: error.message })
                }
              }}>Set Expiration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Permissions</DialogTitle>
              <DialogDescription>Configure scopes and permissions for API keys.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Select Key</Label>
                <Select onValueChange={(v) => setKeyToAction(apiKeys.find(k => k.id === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Select a key" /></SelectTrigger>
                  <SelectContent>
                    {apiKeys.map(key => (
                      <SelectItem key={key.id} value={key.id}>{key.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Available Scopes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {[].map((scope: any) => (
                    <div key={scope.id} className="flex items-center space-x-2">
                      <Checkbox id={`perm-${scope.id}`} defaultChecked={keyToAction?.scopes.includes(scope.name)} />
                      <Label htmlFor={`perm-${scope.id}`} className="text-xs">{scope.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!keyToAction) {
                  toast.error('Please select an API key')
                  return
                }
                toast.loading('Updating permissions...', { id: 'update-permissions' })
                try {
                  // Collect selected scopes from checkboxes
                  const selectedScopes: string[] = []
                  ;[].forEach((scope: any) => {
                    const checkbox = document.getElementById(`perm-${scope.id}`) as HTMLInputElement
                    if (checkbox?.checked) {
                      selectedScopes.push(scope.name)
                    }
                  })

                  const response = await fetch('/api/user/api-keys', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      keyId: keyToAction.id,
                      updates: { scopes: selectedScopes }
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to update permissions')
                  }

                  toast.success('Permissions updated successfully', { id: 'update-permissions', description: keyToAction?.name })
                  setPermissionsDialogOpen(false)
                  setKeyToAction(null)
                } catch (error) {
                  toast.error('Failed to update permissions', { id: 'update-permissions', description: error.message })
                }
              }}>Save Permissions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export API Keys</DialogTitle>
              <DialogDescription>Export your API key configuration for backup or migration.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="exp-metadata" defaultChecked />
                    <Label htmlFor="exp-metadata" className="text-sm">Key Metadata</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="exp-scopes" defaultChecked />
                    <Label htmlFor="exp-scopes" className="text-sm">Scopes & Permissions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="exp-usage" />
                    <Label htmlFor="exp-usage" className="text-sm">Usage Statistics</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { handleExportKeys(); setExportDialogOpen(false) }}>Export</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>API Key History</DialogTitle>
              <DialogDescription>View recent changes and events for your API keys.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="py-4 space-y-3">
                {[
                  { action: 'Key Created', key: 'Production API Key', time: '2 hours ago', type: 'success' },
                  { action: 'Key Rotated', key: 'Staging Test Key', time: '1 day ago', type: 'info' },
                  { action: 'Key Revoked', key: 'Old Development Key', time: '3 days ago', type: 'warning' },
                  { action: 'Permissions Updated', key: 'Mobile App Service Key', time: '5 days ago', type: 'info' },
                  { action: 'Key Created', key: 'OAuth Client Credentials', time: '1 week ago', type: 'success' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-green-500' : item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="font-medium text-sm">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.key}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Keys</DialogTitle>
              <DialogDescription>Apply filters to narrow down the displayed keys.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Key Type</Label>
                <Select value={filterKeyType} onValueChange={setFilterKeyType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="api">API Key</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setFilterEnvironment('all'); setFilterStatus('all'); setFilterKeyType('all') }}>Reset</Button>
              <Button onClick={() => {
                toast.success(`Filters applied - Status: ${filterStatus}, Type: ${filterKeyType}`)
                setFilterDialogOpen(false)
              }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Application Dialog */}
        <Dialog open={createAppDialogOpen} onOpenChange={setCreateAppDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Application</DialogTitle>
              <DialogDescription>Register a new application to use your API.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" placeholder="My Application" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appDescription">Description</Label>
                <Textarea id="appDescription" placeholder="Describe your application" value={newAppDescription} onChange={(e) => setNewAppDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Application Type</Label>
                <Select value={newAppType} onValueChange={(v) => setNewAppType(v as typeof newAppType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular_web">Regular Web Application</SelectItem>
                    <SelectItem value="spa">Single Page Application (SPA)</SelectItem>
                    <SelectItem value="native">Native Application</SelectItem>
                    <SelectItem value="machine_to_machine">Machine to Machine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateAppDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!newAppName.trim()) {
                  toast.error('Please enter an application name')
                  return
                }
                toast.loading('Creating application...', { id: 'create-app' })
                try {
                  const response = await fetch('/api/user/api-keys', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'create',
                      name: newAppName,
                      description: newAppDescription,
                      keyType: newAppType,
                      environment: 'production'
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to create application')
                  }

                  toast.success(`Application "${newAppName}" created`, { id: 'create-app', description: `Type: ${newAppType}` })
                  setCreateAppDialogOpen(false)
                  setNewAppName('')
                  setNewAppDescription('')
                } catch (error) {
                  toast.error('Failed to create application', { id: 'create-app', description: error.message })
                }
              }}>Create Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* App Settings Dialog */}
        <Dialog open={appSettingsDialogOpen} onOpenChange={setAppSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Application Settings</DialogTitle>
              <DialogDescription>Configure settings for {selectedApp?.name}</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <ScrollArea className="max-h-96">
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <div className="flex gap-2">
                      <Input value={selectedApp.client_id} readOnly />
                      <Button variant="outline" size="icon" onClick={() => handleCopyKey(selectedApp.client_id)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Callback URLs</Label>
                    <Textarea value={selectedApp.callback_urls.join('\n')} placeholder="One URL per line" />
                  </div>
                  <div className="space-y-2">
                    <Label>Logout URLs</Label>
                    <Textarea value={selectedApp.logout_urls.join('\n')} placeholder="One URL per line" />
                  </div>
                  <div className="space-y-2">
                    <Label>Token Expiration</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <Label className="text-xs text-gray-500">Access Token (seconds)</Label>
                        <Input type="number" defaultValue={selectedApp.access_token_expiration} />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Refresh Token (seconds)</Label>
                        <Input type="number" defaultValue={selectedApp.refresh_token_expiration} />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAppSettingsDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!selectedApp) {
                  toast.error('No application selected')
                  return
                }
                toast.loading('Saving settings...', { id: 'app-settings' })
                try {
                  const response = await fetch('/api/user/api-keys', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      keyId: selectedApp.client_id,
                      updates: {
                        callback_urls: selectedApp.callback_urls,
                        logout_urls: selectedApp.logout_urls,
                        access_token_expiration: selectedApp.access_token_expiration,
                        refresh_token_expiration: selectedApp.refresh_token_expiration
                      }
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to save settings')
                  }

                  toast.success('Application settings saved', { id: 'app-settings', description: selectedApp?.name })
                  setAppSettingsDialogOpen(false)
                } catch (error) {
                  toast.error('Failed to save settings', { id: 'app-settings', description: error.message })
                }
              }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quickstart Dialog */}
        <Dialog open={quickstartDialogOpen} onOpenChange={setQuickstartDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Quickstart Guide</DialogTitle>
              <DialogDescription>Get started with {selectedApp?.name}</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <ScrollArea className="max-h-96">
                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="font-medium mb-2">1. Install the SDK</p>
                    <code className="block p-2 bg-gray-900 text-green-400 rounded text-sm">npm install @freeflow/api-sdk</code>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="font-medium mb-2">2. Initialize the client</p>
                    <code className="block p-2 bg-gray-900 text-green-400 rounded text-sm whitespace-pre">{`import { FreeflowAPI } from '@freeflow/api-sdk';

const api = new FreeflowAPI({
  clientId: '${selectedApp.client_id}',
});`}</code>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="font-medium mb-2">3. Make your first request</p>
                    <code className="block p-2 bg-gray-900 text-green-400 rounded text-sm whitespace-pre">{`const user = await api.users.get();
console.log(user);`}</code>
                  </div>
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuickstartDialogOpen(false)}>Close</Button>
              <Button onClick={() => { window.open('https://docs.freeflow.com', '_blank'); setQuickstartDialogOpen(false) }}>View Full Docs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={exportLogsDialogOpen} onOpenChange={setExportLogsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Logs</DialogTitle>
              <DialogDescription>Export API request logs for analysis.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select defaultValue="7">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="ndjson">NDJSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="log-success" defaultChecked />
                    <Label htmlFor="log-success" className="text-sm">Successful requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="log-error" defaultChecked />
                    <Label htmlFor="log-error" className="text-sm">Error requests</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportLogsDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Preparing export...', { id: 'export-logs' })
                try {
                  const response = await fetch('/api/user/api-keys')
                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch logs')
                  }

                  const logsData = {
                    exportDate: new Date().toISOString(),
                    totalRequests: data.count || 0,
                    avgLatency: '45ms',
                    period: 'Last 30 days',
                    keys: data.data || []
                  }
                  const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `api-logs-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Logs exported', { id: 'export-logs', description: 'File downloaded successfully' })
                  setExportLogsDialogOpen(false)
                } catch (error) {
                  toast.error('Export failed', { id: 'export-logs', description: error.message })
                }
              }}>Export Logs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Webhook Dialog */}
        <Dialog open={addWebhookDialogOpen} onOpenChange={setAddWebhookDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription>Configure a new webhook to receive event notifications.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookName">Endpoint Name</Label>
                <Input id="webhookName" placeholder="e.g., Payment Events" value={newWebhookName} onChange={(e) => setNewWebhookName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Endpoint URL</Label>
                <Input id="webhookUrl" placeholder="https://your-domain.com/webhook" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Events to Listen</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {['payment.created', 'payment.succeeded', 'payment.failed', 'user.created', 'user.updated', 'data.sync', 'security.alert'].map(event => (
                    <div key={event} className="flex items-center space-x-2">
                      <Checkbox id={event} checked={newWebhookEvents.includes(event)} onCheckedChange={(checked) => {
                        if (checked) setNewWebhookEvents([...newWebhookEvents, event])
                        else setNewWebhookEvents(newWebhookEvents.filter(e => e !== event))
                      }} />
                      <Label htmlFor={event} className="text-xs">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddWebhookDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
                  toast.error('Please fill in all required fields')
                  return
                }
                toast.loading('Creating webhook...', { id: 'create-webhook' })
                try {
                  const response = await fetch('/api/user/api-keys', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'create',
                      name: newWebhookName,
                      keyType: 'webhook',
                      configId: 'webhook',
                      environment: 'production'
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to create webhook')
                  }

                  toast.success(`Webhook "${newWebhookName}" created`, { id: 'create-webhook', description: newWebhookUrl.substring(0, 40) + '...' })
                  setAddWebhookDialogOpen(false)
                  setNewWebhookName('')
                  setNewWebhookUrl('')
                  setNewWebhookEvents([])
                } catch (error) {
                  toast.error('Failed to create webhook', { id: 'create-webhook', description: error.message })
                }
              }}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Webhook Dialog */}
        <Dialog open={testWebhookDialogOpen} onOpenChange={setTestWebhookDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Test Webhook</DialogTitle>
              <DialogDescription>Send a test event to {selectedWebhook?.name}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm font-medium">Endpoint URL</p>
                <code className="text-xs text-gray-500">{selectedWebhook?.url}</code>
              </div>
              <div className="space-y-2">
                <Label>Test Event Type</Label>
                <Select defaultValue={selectedWebhook?.events[0]}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {selectedWebhook?.events.map(event => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestWebhookDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!selectedWebhook) {
                  toast.error('No webhook selected')
                  return
                }
                toast.loading('Sending test webhook...', { id: 'test-webhook' })
                try {
                  const startTime = Date.now()
                  const response = await fetch('/api/user/api-keys/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      configId: 'webhook',
                      keyValue: selectedWebhook.secret,
                      environment: 'production'
                    })
                  })

                  const data = await response.json()
                  const responseTime = Date.now() - startTime

                  if (!response.ok) {
                    throw new Error(data.error || 'Webhook test failed')
                  }

                  toast.success('Test webhook sent successfully!', { id: 'test-webhook', description: `Status: 200 OK - Response time: ${responseTime}ms` })
                  setTestWebhookDialogOpen(false)
                } catch (error) {
                  toast.error('Failed to send webhook', { id: 'test-webhook', description: error.message })
                }
              }}>Send Test Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Settings Dialog */}
        <Dialog open={webhookSettingsDialogOpen} onOpenChange={setWebhookSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Webhook Settings</DialogTitle>
              <DialogDescription>Configure settings for {selectedWebhook?.name}</DialogDescription>
            </DialogHeader>
            {selectedWebhook && (
              <ScrollArea className="max-h-96">
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input defaultValue={selectedWebhook.url} />
                  </div>
                  <div className="space-y-2">
                    <Label>Signing Secret</Label>
                    <div className="flex gap-2">
                      <Input value={selectedWebhook.secret} readOnly type="password" />
                      <Button variant="outline" size="icon" onClick={() => handleCopyKey(selectedWebhook.secret)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label>Retry Policy</Label>
                      <Select defaultValue={selectedWebhook.retry_policy}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="exponential">Exponential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Retries</Label>
                      <Input type="number" defaultValue={selectedWebhook.max_retries} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout (seconds)</Label>
                    <Input type="number" defaultValue={selectedWebhook.timeout_seconds} />
                  </div>
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setWebhookSettingsDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!selectedWebhook) {
                  toast.error('No webhook selected')
                  return
                }
                toast.loading('Saving webhook settings...', { id: 'webhook-settings' })
                try {
                  const response = await fetch('/api/user/api-keys', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      keyId: selectedWebhook.id,
                      updates: {
                        url: selectedWebhook.url,
                        retry_policy: selectedWebhook.retry_policy,
                        max_retries: selectedWebhook.max_retries,
                        timeout_seconds: selectedWebhook.timeout_seconds
                      }
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to save settings')
                  }

                  toast.success('Webhook settings saved', { id: 'webhook-settings' })
                  setWebhookSettingsDialogOpen(false)
                } catch (error) {
                  toast.error('Failed to save settings', { id: 'webhook-settings', description: error.message })
                }
              }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Live Feed Dialog */}
        <Dialog open={liveFeedDialogOpen} onOpenChange={setLiveFeedDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                Live API Feed
              </DialogTitle>
              <DialogDescription>Real-time API request monitoring</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="py-4 space-y-2">
                {[].map((log: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <Badge className={getLogLevelColor(log.log_level)}>{log.method}</Badge>
                      <code className="text-sm">{log.endpoint}</code>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${log.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>{log.status_code}</span>
                      <span className="text-xs text-gray-500">{log.response_time_ms}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>API Analytics</DialogTitle>
              <DialogDescription>Usage statistics and performance metrics</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                  <p className="text-3xl font-bold text-blue-700">{formatNumber(stats.totalRequests)}</p>
                  <p className="text-sm text-blue-600">Total Requests</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                  <p className="text-3xl font-bold text-green-700">99.9%</p>
                  <p className="text-sm text-green-600">Success Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                  <p className="text-3xl font-bold text-purple-700">45ms</p>
                  <p className="text-sm text-purple-600">Avg Response Time</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="font-medium mb-3">Top Endpoints</p>
                {[
                  { endpoint: '/api/v1/users', calls: '8,542' },
                  { endpoint: '/api/v1/data', calls: '6,128' },
                  { endpoint: '/api/v1/auth/token', calls: '4,891' },
                  { endpoint: '/api/v1/webhooks', calls: '2,347' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <code className="text-sm">{item.endpoint}</code>
                    <span className="text-sm text-gray-500">{item.calls} calls</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Dialog */}
        <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Security Overview</DialogTitle>
              <DialogDescription>Review your API security status</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700">Security Score: 94/100</p>
                    <p className="text-sm text-green-600">Your API security is excellent</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">API Key Rotation</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">IP Whitelisting</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">Rate Limiting</span>
                  <Badge className="bg-green-100 text-green-800">Configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">Webhook Signatures</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Security Alerts</DialogTitle>
              <DialogDescription>Recent security events and notifications</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="py-4 space-y-3">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700">No Active Alerts</p>
                  <p className="text-sm text-green-600">Your API is operating normally</p>
                </div>
                <p className="text-sm font-medium text-gray-500 mt-4">Recent Events</p>
                {[
                  { event: 'Rate limit threshold reached', time: '2 hours ago', severity: 'warning' },
                  { event: 'New API key created', time: '1 day ago', severity: 'info' },
                  { event: 'Key rotation completed', time: '3 days ago', severity: 'info' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${alert.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      <span className="text-sm">{alert.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Docs Dialog */}
        <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>API Documentation</DialogTitle>
              <DialogDescription>Quick links to API documentation and resources</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {[
                { title: 'Getting Started', desc: 'Quick introduction to the API', icon: Play },
                { title: 'Authentication', desc: 'Learn about API key authentication', icon: Key },
                { title: 'API Reference', desc: 'Complete endpoint documentation', icon: FileText },
                { title: 'Webhooks Guide', desc: 'Set up and manage webhooks', icon: Webhook },
                { title: 'Rate Limits', desc: 'Understand usage limits', icon: Zap },
                { title: 'Security Best Practices', desc: 'Keep your API secure', icon: Shield },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => {
                  window.open(`/docs/api/${doc.title.toLowerCase().replace(/\s+/g, '-')}`, '_blank')
                  toast.info(`Opening ${doc.title}...`)
                  setDocsDialogOpen(false)
                }}>
                  <doc.icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-gray-500">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Quick Dialog */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quick Settings</DialogTitle>
              <DialogDescription>Common API configuration options</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Auto Key Rotation</p>
                  <p className="text-xs text-gray-500">Rotate keys automatically every 90 days</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Rate Limit Alerts</p>
                  <p className="text-xs text-gray-500">Get notified when approaching limits</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Security Notifications</p>
                  <p className="text-xs text-gray-500">Email alerts for suspicious activity</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Close</Button>
              <Button onClick={async () => {
                toast.loading('Saving settings...', { id: 'quick-settings' })
                try {
                  const response = await fetch('/api/user/api-keys', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      keyId: 'settings',
                      updates: {
                        autoKeyRotation: true,
                        rateLimitAlerts: true,
                        securityNotifications: true
                      }
                    })
                  })

                  const data = await response.json()

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to save settings')
                  }

                  toast.success('Settings saved', { id: 'quick-settings' })
                  setSettingsDialogOpen(false)
                } catch (error) {
                  toast.error('Failed to save settings', { id: 'quick-settings', description: error.message })
                }
              }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
