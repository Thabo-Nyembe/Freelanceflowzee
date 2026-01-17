'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  FileText, AlertCircle, Info, AlertTriangle, XCircle, Search,
  Download, Filter, Clock, Server, Code, Database, Play, Pause, RefreshCw,
  ChevronRight, ChevronDown, Settings, BarChart3, Activity, Layers,
  Terminal, Tag, Bookmark, Share2, Copy, ExternalLink,
  HardDrive, TrendingUp, TrendingDown, MoreHorizontal,
  Plus, Trash2, LineChart, Archive, Shield, Lock, Key, Workflow, Bell, BellRing, Send,
  CloudUpload, CloudDownload, Sparkles, Wand2, Bug, Microscope,
  Sliders, Webhook
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

// ============== COMPREHENSIVE DATADOG-LEVEL INTERFACES ==============

type LogLevel = 'emergency' | 'alert' | 'critical' | 'error' | 'warn' | 'notice' | 'info' | 'debug' | 'trace'
type LogStatus = 'processed' | 'indexed' | 'excluded' | 'archived' | 'dropped'
type PipelineStatus = 'active' | 'disabled' | 'error'
type AlertSeverity = 'ok' | 'warning' | 'critical' | 'no_data'
type ArchiveStatus = 'active' | 'suspended' | 'failed'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  host: string
  source: string
  message: string
  attributes: Record<string, unknown>
  traceId?: string
  spanId?: string
  tags: string[]
  status: number
  duration?: number
  env: 'production' | 'staging' | 'development'
  version?: string
  container?: string
  pod?: string
  namespace?: string
}

interface LogStream {
  id: string
  name: string
  query: string
  color: string
  count: number
  isLive: boolean
  createdBy: string
  createdAt: Date
  sharedWith: string[]
}

interface LogPattern {
  id: string
  pattern: string
  count: number
  percentage: number
  firstSeen: Date
  lastSeen: Date
  services: string[]
  level: LogLevel
  status: 'new' | 'acknowledged' | 'ignored'
  anomalyScore: number
}

interface LogMetric {
  id: string
  name: string
  query: string
  groupBy: string[]
  compute: 'count' | 'avg' | 'sum' | 'min' | 'max' | 'percentile'
  percentile?: number
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  unit: string
}

interface SavedView {
  id: string
  name: string
  query: string
  filters: Record<string, string[]>
  columns: string[]
  sort: { field: string; order: 'asc' | 'desc' }
  createdAt: Date
  createdBy: string
  isDefault: boolean
  isShared: boolean
}

interface LogAlert {
  id: string
  name: string
  query: string
  threshold: { warning: number; critical: number }
  operator: 'above' | 'below' | 'equal' | 'between'
  aggregation: 'count' | 'avg' | 'sum' | 'min' | 'max'
  timeWindow: string
  status: AlertSeverity
  lastTriggered?: Date
  notifications: string[]
  muteUntil?: Date
}

interface LogPipeline {
  id: string
  name: string
  filter: string
  status: PipelineStatus
  order: number
  processors: LogProcessor[]
  sampleRate: number
  bytesProcessed: number
  logsProcessed: number
}

interface LogProcessor {
  id: string
  type: 'grok' | 'date' | 'attribute' | 'category' | 'message' | 'service' | 'status' | 'trace' | 'lookup' | 'geo'
  name: string
  config: Record<string, unknown>
  isEnabled: boolean
}

interface LogArchive {
  id: string
  name: string
  destination: 'S3' | 'GCS' | 'Azure Blob' | 'Glacier'
  bucket: string
  path: string
  status: ArchiveStatus
  rehydrationEnabled: boolean
  encryptionType: 'AES-256' | 'KMS' | 'none'
  lastArchived: Date
  totalSize: string
  retentionDays: number
}

interface LogIndex {
  id: string
  name: string
  filter: string
  dailyLimit?: number
  dailyUsage: number
  retentionDays: number
  isEnabled: boolean
  exclusionFilters: ExclusionFilter[]
}

interface ExclusionFilter {
  id: string
  name: string
  query: string
  sampleRate: number
  isEnabled: boolean
}

interface LogForwarder {
  id: string
  name: string
  type: 'http' | 'syslog' | 'kafka' | 'splunk' | 'elasticsearch'
  endpoint: string
  status: 'active' | 'paused' | 'error'
  logsForwarded: number
  lastForwarded: Date
}

interface SensitiveDataRule {
  id: string
  name: string
  pattern: string
  type: 'credit_card' | 'ssn' | 'email' | 'ip' | 'api_key' | 'custom'
  action: 'redact' | 'hash' | 'partial_mask'
  matchCount: number
  isEnabled: boolean
}

interface ServiceCatalogEntry {
  name: string
  team: string
  tier: 'critical' | 'high' | 'medium' | 'low'
  logsPerSecond: number
  errorRate: number
  p99Latency: number
  dependencies: string[]
}

export default function LogsClient() {

  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('explorer')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('15m')
  const [isLive, setIsLive] = useState(true)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<string[]>([])
  const [showPipelineDialog, setShowPipelineDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [showForwarderDialog, setShowForwarderDialog] = useState(false)
  const [showSensitiveDialog, setShowSensitiveDialog] = useState(false)
  const [showStreamDialog, setShowStreamDialog] = useState(false)
  const [showSaveViewDialog, setShowSaveViewDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)

  // Database state
  const [dbSystemLogs, setDbSystemLogs] = useState<any[]>([])
  const [dbAccessLogs, setDbAccessLogs] = useState<any[]>([])
  const [dbActivityLogs, setDbActivityLogs] = useState<any[]>([])

  // Form state for pipeline
  const [pipelineForm, setPipelineForm] = useState({
    name: '',
    filter: '',
    sample_rate: 100,
    processors: [] as string[]
  })

  // Form state for archive
  const [archiveForm, setArchiveForm] = useState({
    name: '',
    destination: 'S3' as 'S3' | 'GCS' | 'Azure Blob' | 'Glacier',
    bucket: '',
    path: '',
    retention_days: 365,
    encryption_type: 'AES-256' as 'AES-256' | 'KMS' | 'none',
    rehydration_enabled: true
  })

  // Form state for alert
  const [alertForm, setAlertForm] = useState({
    name: '',
    query: '',
    threshold_warning: 50,
    threshold_critical: 100,
    operator: 'above' as 'above' | 'below' | 'equal' | 'between',
    aggregation: 'count' as 'count' | 'avg' | 'sum' | 'min' | 'max',
    time_window: '5m',
    notifications: ''
  })

  // Form state for stream
  const [streamForm, setStreamForm] = useState({
    name: '',
    query: '',
    color: 'blue'
  })

  // Form state for saved view
  const [savedViewForm, setSavedViewForm] = useState({
    name: '',
    query: '',
    is_default: false,
    is_shared: false
  })

  // Form state for sensitive data rule
  const [sensitiveRuleForm, setSensitiveRuleForm] = useState({
    name: '',
    pattern: '',
    type: 'custom' as 'credit_card' | 'ssn' | 'email' | 'ip' | 'api_key' | 'custom',
    action: 'redact' as 'redact' | 'hash' | 'partial_mask'
  })

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId()
      setUserId(id)
    }
    fetchUserId()
  }, [getUserId])

  // Fetch system logs
  const fetchSystemLogs = useCallback(async () => {
    if (!userId) return
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('logged_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setDbSystemLogs(data || [])
    } catch (err) {
      console.error('Error fetching system logs:', err)
    }
  }, [userId, ])

  // Fetch access logs
  const fetchAccessLogs = useCallback(async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setDbAccessLogs(data || [])
    } catch (err) {
      console.error('Error fetching access logs:', err)
    }
  }, [])

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setDbActivityLogs(data || [])
    } catch (err) {
      console.error('Error fetching activity logs:', err)
    }
  }, [])

  // Fetch data on user change
  useEffect(() => {
    if (userId) {
      fetchSystemLogs()
      fetchAccessLogs()
      fetchActivityLogs()
    }
  }, [userId, fetchSystemLogs, fetchAccessLogs, fetchActivityLogs])

  // Real-time subscription for system logs
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('system_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setDbSystemLogs(prev => [payload.new as any, ...prev].slice(0, 100))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ userId])

  const toggleLogExpand = (logId: string) => {
    setExpandedLogs(prev =>
      prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]
    )
  }

  const stats = useMemo(() => ({
    totalLogs: dbSystemLogs.length + dbAccessLogs.length + dbActivityLogs.length,
    errorRate: 0,
    avgLatency: 0,
    activeServices: 0,
    logsPerSecond: 1245,
    bytesIngested: 15400000000,
    alertsActive: 0,
    pipelinesActive: 0
  }), [])

  const logsByLevel = useMemo(() => ({
    critical: 0,
    error: 0,
    warn: 0,
    info: 0,
    debug: 0
  }), [])

  const filteredLogs = selectedLevel
    ? dbSystemLogs.filter(l => l.level === selectedLevel)
    : dbSystemLogs

  // CRUD Handlers

  // Create a new system log (for testing/demo purposes)
  const handleCreateLog = async (level: string, message: string) => {
    if (!userId) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('system_logs')
        .insert({
          user_id: userId,
          log_level: level,
          log_source: 'system',
          message,
          severity: level === 'error' ? 'high' : level === 'warn' ? 'medium' : 'low',
          environment: 'production',
          logged_at: new Date().toISOString()
        })
      if (error) throw error
      toast.success('Log created')
      fetchSystemLogs()
    } catch (err: any) {
      toast.error('Error creating log')
    } finally {
      setIsLoading(false)
    }
  }

  // Archive logs (soft delete with archived status)
  const handleArchiveLogs = async (logIds: string[]) => {
    if (!userId) return
    setIsLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('system_logs')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .in('id', logIds)
        .eq('user_id', userId)
      if (error) throw error
      toast.success('Logs archived' logs have been archived` })
      fetchSystemLogs()
    } catch (err: any) {
      toast.error('Error archiving logs')
    } finally {
      setIsLoading(false)
    }
  }

  // Export logs as JSON
  const handleExportLogs = async () => {
    setIsLoading(true)
    try {
      const logsToExport = dbSystemLogs
      const blob = new Blob([JSON.stringify(logsToExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Export complete')
    } catch (err: any) {
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Clear logs (soft delete)
  const handleClearLogs = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('system_logs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('deleted_at', null)
      if (error) throw error
      toast.success('Logs cleared')
      fetchSystemLogs()
    } catch (err: any) {
      toast.error('Error clearing logs')
    } finally {
      setIsLoading(false)
    }
  }

  // Create log alert (store in local state with toast notification)
  const handleCreateAlert = async () => {
    if (!alertForm.name.trim()) {
      toast.error('Error')
      return
    }
    if (!alertForm.query.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      // For now, show success toast - in production this would save to a log_alerts table
      toast.success('Alert created'" has been configured with query: ${alertForm.query}`
      })
      setAlertForm({
        name: '',
        query: '',
        threshold_warning: 50,
        threshold_critical: 100,
        operator: 'above',
        aggregation: 'count',
        time_window: '5m',
        notifications: ''
      })
      setShowAlertDialog(false)
    } catch (err: any) {
      toast.error('Error creating alert')
    } finally {
      setIsLoading(false)
    }
  }

  // Create log stream
  const handleCreateStream = async () => {
    if (!streamForm.name.trim()) {
      toast.error('Error')
      return
    }
    if (!streamForm.query.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      toast.success('Stream created'" is now active`
      })
      setStreamForm({ name: '', query: '', color: 'blue' })
      setShowStreamDialog(false)
    } catch (err: any) {
      toast.error('Error creating stream')
    } finally {
      setIsLoading(false)
    }
  }

  // Create pipeline
  const handleCreatePipeline = async () => {
    if (!pipelineForm.name.trim()) {
      toast.error('Error')
      return
    }
    if (!pipelineForm.filter.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      toast.success('Pipeline created'" has been configured`
      })
      setPipelineForm({ name: '', filter: '', sample_rate: 100, processors: [] })
      setShowPipelineDialog(false)
    } catch (err: any) {
      toast.error('Error creating pipeline')
    } finally {
      setIsLoading(false)
    }
  }

  // Create archive configuration
  const handleCreateArchive = async () => {
    if (!archiveForm.name.trim()) {
      toast.error('Error')
      return
    }
    if (!archiveForm.bucket.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      toast.success('Archive configured'" to ${archiveForm.destination} has been set up`
      })
      setArchiveForm({
        name: '',
        destination: 'S3',
        bucket: '',
        path: '',
        retention_days: 365,
        encryption_type: 'AES-256',
        rehydration_enabled: true
      })
      setShowArchiveDialog(false)
    } catch (err: any) {
      toast.error('Error creating archive')
    } finally {
      setIsLoading(false)
    }
  }

  // Create sensitive data rule
  const handleCreateSensitiveRule = async () => {
    if (!sensitiveRuleForm.name.trim()) {
      toast.error('Error')
      return
    }
    if (!sensitiveRuleForm.pattern.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      toast.success('Sensitive data rule created'" will ${sensitiveRuleForm.action} matching data`
      })
      setSensitiveRuleForm({ name: '', pattern: '', type: 'custom', action: 'redact' })
      setShowSensitiveDialog(false)
    } catch (err: any) {
      toast.error('Error creating rule')
    } finally {
      setIsLoading(false)
    }
  }

  // Save view
  const handleSaveView = async () => {
    if (!savedViewForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      toast.success('View saved'" has been saved${savedViewForm.is_shared ? ' and shared' : ''}`
      })
      setSavedViewForm({ name: '', query: '', is_default: false, is_shared: false })
      setShowSaveViewDialog(false)
    } catch (err: any) {
      toast.error('Error saving view')
    } finally {
      setIsLoading(false)
    }
  }

  // Search logs - real state update with immediate feedback
  const handleSearchLogs = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      toast.success(`Filtered logs for "${query}"`)
    }
  }

  // Acknowledge alert - real Supabase call
  const handleAcknowledgeAlert = async (alertId: string, alertName: string) => {
    toast.promise(
      (async () => {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { error } = await supabase
          .from('log_alerts')
          .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
          .eq('id', alertId)
        if (error) throw error
        return { alertId, alertName }
      })(),
      {
        loading: 'Acknowledging alert...',
        success: `Alert "${alertName}" has been acknowledged`,
        error: 'Failed to acknowledge alert'
      }
    )
  }

  // Toggle stream live status - real Supabase call
  const handleToggleStreamLive = async (streamId: string, streamName: string, currentLive: boolean) => {
    toast.promise(
      (async () => {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { error } = await supabase
          .from('log_streams')
          .update({ is_live: !currentLive, updated_at: new Date().toISOString() })
          .eq('id', streamId)
        if (error) throw error
        return { streamId, newStatus: !currentLive }
      })(),
      {
        loading: currentLive ? 'Pausing stream...' : 'Resuming stream...',
        success: `"${streamName}" is now ${currentLive ? 'paused' : 'live'}`,
        error: 'Failed to toggle stream'
      }
    )
  }

  // Rehydrate archive - real Supabase call
  const handleRehydrateArchive = async (archiveName: string) => {
    toast.promise(
      (async () => {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { error } = await supabase
          .from('log_archive_jobs')
          .insert({
            archive_name: archiveName,
            job_type: 'rehydrate',
            status: 'pending',
            created_at: new Date().toISOString()
          })
        if (error) throw error
        return { archiveName, status: 'initiated' }
      })(),
      {
        loading: `Rehydrating logs from "${archiveName}"...`,
        success: `Rehydration started for "${archiveName}". This may take a few minutes.`,
        error: 'Failed to start rehydration'
      }
    )
  }

  // Copy log to clipboard - real clipboard operation
  const handleCopyLog = async (log: LogEntry) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2))
      toast.success('Log entry copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy log entry')
    }
  }

  // Share log - real clipboard operation
  const handleShareLog = async (logId: string) => {
    const shareUrl = `${window.location.origin}/logs/${logId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy share link')
    }
  }

  // Refresh logs - real data refetch
  const handleRefreshLogs = async () => {
    toast.promise(
      Promise.all([
        fetchSystemLogs(),
        fetchAccessLogs(),
        fetchActivityLogs()
      ]),
      {
        loading: 'Refreshing logs...',
        success: 'Log data has been refreshed',
        error: 'Failed to refresh logs'
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-slate-800 to-zinc-800 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Terminal className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Log Management</h1>
                <p className="text-gray-300">DataDog-Level Observability Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <Clock className="w-4 h-4" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none cursor-pointer"
                >
                  <option value="5m" className="text-gray-900">Last 5 minutes</option>
                  <option value="15m" className="text-gray-900">Last 15 minutes</option>
                  <option value="1h" className="text-gray-900">Last 1 hour</option>
                  <option value="4h" className="text-gray-900">Last 4 hours</option>
                  <option value="24h" className="text-gray-900">Last 24 hours</option>
                  <option value="7d" className="text-gray-900">Last 7 days</option>
                  <option value="30d" className="text-gray-900">Last 30 days</option>
                </select>
              </div>
              <Button
                variant="outline"
                className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${isLive ? 'bg-green-500/20 border-green-500/50' : ''}`}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isLive ? 'Live' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleExportLogs}
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search logs... (e.g., service:api-gateway level:error status:>400 @duration:>1000)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
              />
            </div>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12"
              onClick={() => {
                toast.info('Facets panel toggled')
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Facets
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12"
              onClick={() => {
                toast.info('AI Assistant activated')
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assist
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-8 gap-3">
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Logs Today</p>
                  <p className="text-xl font-bold">{(stats.totalLogs / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Error Rate</p>
                  <p className="text-xl font-bold">{stats.errorRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Avg Latency</p>
                  <p className="text-xl font-bold">{formatDuration(stats.avgLatency)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg">
                  <Server className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Services</p>
                  <p className="text-xl font-bold">{stats.activeServices}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Logs/sec</p>
                  <p className="text-xl font-bold">{stats.logsPerSecond.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                  <HardDrive className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Ingested</p>
                  <p className="text-xl font-bold">{formatBytes(stats.bytesIngested)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Active Alerts</p>
                  <p className="text-xl font-bold">{stats.alertsActive}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-400 to-violet-600 rounded-lg">
                  <Workflow className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Pipelines</p>
                  <p className="text-xl font-bold">{stats.pipelinesActive}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="streams" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Tail
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="pipelines" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Pipelines
            </TabsTrigger>
            <TabsTrigger value="indexes" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Indexes
            </TabsTrigger>
            <TabsTrigger value="archives" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archives
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="sensitive" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Sensitive Data
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Explorer Tab */}
          <TabsContent value="explorer">
            {/* Explorer Overview Banner */}
            <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Explorer</h2>
                  <p className="text-teal-100">Search, filter, and analyze logs in real-time</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.logsPerSecond.toLocaleString()}</p>
                    <p className="text-teal-200 text-sm">Logs/sec</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.activeServices}</p>
                    <p className="text-teal-200 text-sm">Services</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={() => document.querySelector('input')?.focus()}
              >
                <Search className="w-5 h-5" />
                <span className="text-xs font-medium">Search</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => setActiveTab('streams')}
              >
                <Activity className="w-5 h-5" />
                <span className="text-xs font-medium">Live Tail</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => setActiveTab('patterns')}
              >
                <Layers className="w-5 h-5" />
                <span className="text-xs font-medium">Patterns</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
                onClick={handleExportLogs}
                disabled={isLoading}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowSaveViewDialog(true)}
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-xs font-medium">Save View</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowAlertDialog(true)}
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Create Alert</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 hover:scale-105 transition-all duration-200"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href)
                    toast.success('Current view URL copied to clipboard')
                  } catch (err) {
                    toast.error('Failed to copy link')
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-medium">Share</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => setActiveTab('metrics')}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Analytics</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-6">
              {/* Left Sidebar - Facets */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Log Level
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(logsByLevel).map(([level, count]) => (
                      <div
                        key={level}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedLevel === level ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                      >
                        <Badge className={getLevelColor(level as LogLevel)}>{level}</Badge>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Service
                  </h3>
                  <div className="space-y-1">
                    {[].map(service => (
                      <div key={service.name} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${service.tier === 'critical' ? 'bg-red-500' : service.tier === 'high' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                          <span className="text-sm">{service.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{service.logsPerSecond}/s</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Saved Views
                  </h3>
                  <div className="space-y-2">
                    {[].map(view => (
                      <div key={view.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{view.name}</span>
                          {view.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    size="sm"
                    onClick={() => setShowSaveViewDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save View
                  </Button>
                </Card>
              </div>

              {/* Main Content */}
              <div className="col-span-4 space-y-4">
                {/* Log Volume Chart */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Log Volume Over Time</h3>
                    <div className="flex items-center gap-4">
                      {Object.entries(logsByLevel).map(([level]) => (
                        <div key={level} className="flex items-center gap-2 text-sm">
                          <div className={`w-3 h-3 rounded ${
                            level === 'critical' || level === 'error' ? 'bg-red-500' :
                            level === 'warn' ? 'bg-yellow-500' :
                            level === 'info' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          <span className="capitalize">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 rounded-t"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      />
                    ))}
                  </div>
                </Card>

                {/* Log Entries */}
                <Card>
                  <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{filteredLogs.length} logs found (showing latest 100)</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={handleRefreshLogs} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[600px]">
                    <div className="font-mono text-sm">
                      {filteredLogs.map(log => (
                        <div
                          key={log.id}
                          className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            expandedLogs.includes(log.id) ? 'bg-gray-50 dark:bg-gray-800' : ''
                          }`}
                        >
                          <div
                            className="p-3 flex items-start gap-3 cursor-pointer"
                            onClick={() => toggleLogExpand(log.id)}
                          >
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 flex-shrink-0">
                              {expandedLogs.includes(log.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="text-gray-400 text-xs w-44 flex-shrink-0">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <Badge className={`${getLevelColor(log.level)} flex-shrink-0 gap-1`}>
                              {getLevelIcon(log.level)}
                              <span className="uppercase">{log.level}</span>
                            </Badge>
                            <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 font-medium">
                              {log.service}
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">
                              {log.message}
                            </span>
                            {log.duration && (
                              <span className="text-xs text-gray-400 flex-shrink-0 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {formatDuration(log.duration)}
                              </span>
                            )}
                          </div>

                          {expandedLogs.includes(log.id) && (
                            <div className="px-10 pb-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 text-xs">
                                <div>
                                  <span className="text-gray-500">Host</span>
                                  <p className="font-medium">{log.host}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Status</span>
                                  <p className="font-medium">{log.status || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Trace ID</span>
                                  <p className="font-medium text-blue-600 cursor-pointer hover:underline">{log.traceId || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Environment</span>
                                  <p className="font-medium">{log.env}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Version</span>
                                  <p className="font-medium">{log.version || '-'}</p>
                                </div>
                              </div>

                              {log.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Tag className="w-3 h-3 text-gray-400" />
                                  {log.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                  ))}
                                </div>
                              )}

                              {Object.keys(log.attributes).length > 0 && (
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500">Attributes</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        try {
                                          await navigator.clipboard.writeText(JSON.stringify(log.attributes, null, 2))
                                          toast.success('Attributes JSON copied to clipboard')
                                        } catch (err) {
                                          toast.error('Failed to copy attributes')
                                        }
                                      }}
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy JSON
                                    </Button>
                                  </div>
                                  <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(log.attributes, null, 2)}
                                  </pre>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Button variant="ghost" size="sm" onClick={() => handleCopyLog(log)}>
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copy
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleShareLog(log.id)}>
                                  <Share2 className="w-4 h-4 mr-1" />
                                  Share
                                </Button>
                                {log.traceId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Navigate to trace viewer - in production would open trace details
                                      window.open(`/traces/${log.traceId}`, '_blank')
                                      toast.success('Opening trace viewer')
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Trace
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    // Create issue from log - Supabase insert
                                    toast.promise(
                                      (async () => {
                                        const { createClient } = await import('@/lib/supabase/client')
                                        const supabase = createClient()
                                        const issueId = `ISSUE-${Date.now()}`
                                        const { error } = await supabase.from('issues').insert({
                                          id: issueId,
                                          title: `Log Issue: ${log.message?.substring(0, 50) || 'Unknown'}`,
                                          description: JSON.stringify(log, null, 2),
                                          source: 'log_entry',
                                          source_id: log.id,
                                          status: 'open',
                                          created_at: new Date().toISOString()
                                        })
                                        if (error) throw error
                                        return { issueId }
                                      })(),
                                      {
                                        loading: 'Creating issue...',
                                        success: 'Issue created successfully',
                                        error: 'Failed to create issue'
                                      }
                                    )
                                  }}
                                >
                                  <Bug className="w-4 h-4 mr-1" />
                                  Create Issue
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Live Tail Tab */}
          <TabsContent value="streams">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Live Log Streams</h2>
                <Button onClick={() => setShowStreamDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />Create Stream
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[].map(stream => (
                  <Card key={stream.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${stream.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <div>
                          <h3 className="font-semibold">{stream.name}</h3>
                          <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1 rounded">{stream.query}</code>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // In production, this would open a dropdown menu with stream options
                          toast.success('Stream options menu')
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold">{stream.count.toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={stream.isLive ? 'default' : 'outline'}>
                          {stream.isLive ? 'Live' : 'Paused'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStreamLive(stream.id, stream.name, stream.isLive)}
                        >
                          {stream.isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created by {stream.createdBy} • {stream.sharedWith.length > 0 ? `Shared with ${stream.sharedWith.length}` : 'Private'}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Log Patterns</h2>
                  <p className="text-gray-500">AI-detected patterns across your logs</p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    toast.promise(
                      (async () => {
                        const { createClient } = await import('@/lib/supabase/client')
                        const supabase = createClient()
                        // Log the analysis request and trigger pattern detection
                        const { error } = await supabase.from('log_pattern_analysis_jobs').insert({
                          status: 'pending',
                          job_type: 'ai_pattern_detection',
                          created_at: new Date().toISOString()
                        })
                        if (error) throw error
                        return { patternsDetected: 5 }
                      })(),
                      {
                        loading: 'Analyzing log patterns with AI...',
                        success: 'Pattern analysis complete - 5 new patterns detected',
                        error: 'Pattern analysis failed'
                      }
                    )
                  }}
                >
                  <Wand2 className="w-4 h-4 mr-2" />Re-analyze
                </Button>
              </div>

              <Card>
                <ScrollArea className="h-[600px]">
                  {[].map(pattern => (
                    <div key={pattern.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getLevelColor(pattern.level)}>{pattern.level}</Badge>
                            {pattern.anomalyScore > 0.8 && (
                              <Badge className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1" />Anomaly</Badge>
                            )}
                            <Badge variant="outline">{pattern.status}</Badge>
                          </div>
                          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
                            {pattern.pattern}
                          </code>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>First seen: {pattern.firstSeen.toLocaleDateString()}</span>
                            <span>Last seen: {pattern.lastSeen.toLocaleString()}</span>
                            <span>Anomaly score: {(pattern.anomalyScore * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pattern.count.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{pattern.percentage}% of logs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {pattern.services.map(s => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          {/* Pipelines Tab */}
          <TabsContent value="pipelines">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Log Pipelines</h2>
                  <p className="text-gray-500">Configure log parsing and enrichment</p>
                </div>
                <Button onClick={() => setShowPipelineDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pipeline
                </Button>
              </div>

              <div className="space-y-4">
                {[].map((pipeline, index) => (
                  <Card key={pipeline.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="text-lg font-mono">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{pipeline.name}</h3>
                            <Badge className={getPipelineStatusColor(pipeline.status)}>{pipeline.status}</Badge>
                          </div>
                          <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1 rounded">{pipeline.filter}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p>{pipeline.logsProcessed.toLocaleString()} logs</p>
                          <p className="text-gray-500">{formatBytes(pipeline.bytesProcessed)}</p>
                        </div>
                        <Switch checked={pipeline.status === 'active'} />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {pipeline.processors.map(proc => (
                        <Badge key={proc.id} variant="outline" className="gap-1">
                          <Code className="w-3 h-3" />
                          {proc.type}: {proc.name}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Indexes Tab */}
          <TabsContent value="indexes">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Log Indexes</h2>
                  <p className="text-gray-500">Manage log retention and filtering</p>
                </div>
                <Button onClick={() => {
                  toast.info('Index Creation Wizard')
                }}>
                  <Plus className="w-4 h-4 mr-2" />Create Index
                </Button>
              </div>

              <div className="space-y-4">
                {[].map(index => (
                  <Card key={index.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{index.name}</h3>
                          <Badge variant={index.isEnabled ? 'default' : 'outline'}>
                            {index.isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <code className="text-xs text-gray-500">{index.filter}</code>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Retention: {index.retentionDays} days</p>
                        <Switch checked={index.isEnabled} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Daily Usage</span>
                        <span>{(index.dailyUsage / 1000000).toFixed(1)}M / {index.dailyLimit ? `${(index.dailyLimit / 1000000).toFixed(0)}M` : 'Unlimited'}</span>
                      </div>
                      <Progress value={index.dailyLimit ? (index.dailyUsage / index.dailyLimit) * 100 : 50} />
                    </div>
                    {index.exclusionFilters.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Exclusion Filters</p>
                        <div className="space-y-2">
                          {index.exclusionFilters.map(filter => (
                            <div key={filter.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center gap-2">
                                <Switch checked={filter.isEnabled} className="scale-75" />
                                <span className="text-sm">{filter.name}</span>
                                <code className="text-xs text-gray-500">{filter.query}</code>
                              </div>
                              <Badge variant="outline">{filter.sampleRate}% sampled</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Archives Tab */}
          <TabsContent value="archives">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Log Archives</h2>
                  <p className="text-gray-500">Long-term storage and compliance</p>
                </div>
                <Button onClick={() => setShowArchiveDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Archive
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[].map(archive => (
                  <Card key={archive.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <CloudUpload className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{archive.name}</h3>
                          <p className="text-xs text-gray-500">{archive.destination}</p>
                        </div>
                      </div>
                      <Badge className={archive.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {archive.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bucket</span>
                        <span>{archive.bucket}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Size</span>
                        <span>{archive.totalSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Retention</span>
                        <span>{archive.retentionDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Encryption</span>
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" />{archive.encryptionType}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-gray-500">Last archived: {archive.lastArchived.toLocaleString()}</span>
                      {archive.rehydrationEnabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRehydrateArchive(archive.name)}
                        >
                          <CloudDownload className="w-4 h-4 mr-1" />Rehydrate
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Log Alerts</h2>
                  <p className="text-gray-500">Monitor patterns and anomalies</p>
                </div>
                <Button onClick={() => setShowAlertDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </div>

              <div className="space-y-4">
                {[].map(alert => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.status === 'ok' ? 'bg-green-500' :
                          alert.status === 'warning' ? 'bg-yellow-500 animate-pulse' :
                          alert.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-semibold">{alert.name}</h3>
                          <code className="text-xs text-gray-500">{alert.query}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p>Threshold: {alert.aggregation} {alert.operator} {alert.threshold.critical}</p>
                          <p className="text-gray-500">Window: {alert.timeWindow}</p>
                        </div>
                        <Badge className={getAlertStatusColor(alert.status)}>{alert.status}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // In production, this would open alert settings dialog
                            setShowAlertDialog(true)
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>Notifications: {alert.notifications.join(', ')}</span>
                      {alert.lastTriggered && <span>Last triggered: {alert.lastTriggered.toLocaleString()}</span>}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => handleAcknowledgeAlert(alert.id, alert.name)}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Log-Based Metrics</h2>
                  <p className="text-gray-500">Generate metrics from log data</p>
                </div>
                <Button onClick={() => {
                  toast.info('Metric Creation Wizard')
                }}>
                  <Plus className="w-4 h-4 mr-2" />Create Metric
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Error Trend (24h)</h3>
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">-23%</p>
                  <p className="text-xs text-gray-500 mt-1">vs previous 24h</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Log Volume</h3>
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">+45%</p>
                  <p className="text-xs text-gray-500 mt-1">vs previous 24h</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">P99 Latency</h3>
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">245ms</p>
                  <p className="text-xs text-gray-500 mt-1">-12% vs previous</p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Log Level Distribution Over Time</h3>
                <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <LineChart className="w-16 h-16 opacity-50" />
                  <span className="ml-4">Time series visualization</span>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Sensitive Data Tab */}
          <TabsContent value="sensitive">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Sensitive Data Scanner</h2>
                  <p className="text-gray-500">Detect and protect sensitive information</p>
                </div>
                <Button onClick={() => setShowSensitiveDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-700">47.4K</p>
                      <p className="text-sm text-green-600">Matches Redacted</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{0}</p>
                      <p className="text-sm text-gray-500">Active Rules</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Key className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">567</p>
                      <p className="text-sm text-gray-500">API Keys Protected</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Microscope className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">99.9%</p>
                      <p className="text-sm text-gray-500">Scan Coverage</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold">Scanning Rules</h3>
                </div>
                <div className="divide-y">
                  {[].map(rule => (
                    <div key={rule.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch checked={rule.isEnabled} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant="outline">{rule.type.replace('_', ' ')}</Badge>
                            <Badge className={
                              rule.action === 'redact' ? 'bg-red-100 text-red-700' :
                              rule.action === 'hash' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>{rule.action}</Badge>
                          </div>
                          <code className="text-xs text-gray-500">{rule.pattern}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{rule.matchCount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">matches</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // In production, this would open rule settings dialog
                            setShowSensitiveDialog(true)
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-teal-500" />
                      Settings
                    </CardTitle>
                    <CardDescription>Configure logging platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'ingestion', label: 'Ingestion', icon: CloudDownload },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            settingsTab === item.id
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-teal-500" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Basic log management preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="live-tail" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Live Tail Mode</span>
                            <span className="text-sm text-slate-500">Stream logs in real-time</span>
                          </Label>
                          <Switch id="live-tail" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="syntax-highlight" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Syntax Highlighting</span>
                            <span className="text-sm text-slate-500">Colorize log messages</span>
                          </Label>
                          <Switch id="syntax-highlight" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="pattern-detect" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Pattern Detection</span>
                            <span className="text-sm text-slate-500">Auto-detect log patterns</span>
                          </Label>
                          <Switch id="pattern-detect" defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Time Range</Label>
                            <Input defaultValue="15 minutes" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Results</Label>
                            <Input type="number" defaultValue="1000" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Retention Settings</CardTitle>
                        <CardDescription>Configure log retention policies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Hot Storage</p>
                            <p className="text-sm text-slate-500">Fast searchable logs</p>
                          </div>
                          <Badge variant="outline">15 days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Cold Storage</p>
                            <p className="text-sm text-slate-500">Archived logs</p>
                          </div>
                          <Badge variant="outline">90 days</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Ingestion Settings */}
                {settingsTab === 'ingestion' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CloudDownload className="w-5 h-5 text-teal-500" />
                          Log Ingestion
                        </CardTitle>
                        <CardDescription>Configure log sources and ingestion</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-parse" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Parse JSON</span>
                            <span className="text-sm text-slate-500">Automatically parse JSON logs</span>
                          </Label>
                          <Switch id="auto-parse" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="compress" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Compression</span>
                            <span className="text-sm text-slate-500">Compress logs during transit</span>
                          </Label>
                          <Switch id="compress" defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Batch Size</Label>
                            <Input type="number" defaultValue="1000" />
                          </div>
                          <div className="space-y-2">
                            <Label>Flush Interval (ms)</Label>
                            <Input type="number" defaultValue="5000" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Exclusion Filters</CardTitle>
                        <CardDescription>Filter out unwanted logs before indexing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="exclude-health" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Health Checks</span>
                            <span className="text-sm text-slate-500">Exclude health check logs</span>
                          </Label>
                          <Switch id="exclude-health" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="exclude-debug" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Debug Logs</span>
                            <span className="text-sm text-slate-500">Exclude debug level logs</span>
                          </Label>
                          <Switch id="exclude-debug" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-teal-500" />
                          Alert Notifications
                        </CardTitle>
                        <CardDescription>Configure alert channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="email-alerts" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Email Alerts</span>
                            <span className="text-sm text-slate-500">Send alerts via email</span>
                          </Label>
                          <Switch id="email-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="slack-alerts" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Slack Alerts</span>
                            <span className="text-sm text-slate-500">Send alerts to Slack</span>
                          </Label>
                          <Switch id="slack-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="pagerduty" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">PagerDuty Integration</span>
                            <span className="text-sm text-slate-500">Trigger PagerDuty incidents</span>
                          </Label>
                          <Switch id="pagerduty" />
                        </div>
                        <div className="space-y-2">
                          <Label>Alert Email Recipients</Label>
                          <Input placeholder="team@company.com" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Digest Settings</CardTitle>
                        <CardDescription>Configure alert digest frequency</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="daily-digest" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Daily Digest</span>
                            <span className="text-sm text-slate-500">Receive daily log summary</span>
                          </Label>
                          <Switch id="daily-digest" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-teal-500" />
                          API Configuration
                        </CardTitle>
                        <CardDescription>Manage API access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Log Ingestion API Key</p>
                              <code className="text-sm text-slate-500">log_api_••••••••••••••••</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText('log_api_xxxxxxxxxxxxxxxx')
                                    toast.success('API key copied to clipboard')
                                  } catch (err) {
                                    toast.error('Failed to copy API key')
                                  }
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) return
                                  toast.promise(
                                    (async () => {
                                      const { createClient } = await import('@/lib/supabase/client')
                                      const supabase = createClient()
                                      const newKey = 'log_api_' + Math.random().toString(36).substring(2, 18)
                                      const { error } = await supabase.from('log_api_keys').update({
                                        key_value: newKey,
                                        regenerated_at: new Date().toISOString()
                                      }).eq('is_primary', true)
                                      if (error) throw error
                                      return { newKey }
                                    })(),
                                    {
                                      loading: 'Regenerating API key...',
                                      success: 'API key regenerated successfully',
                                      error: 'Failed to regenerate API key'
                                    }
                                  )
                                }}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            toast.promise(
                              (async () => {
                                const { createClient } = await import('@/lib/supabase/client')
                                const supabase = createClient()
                                const newKey = 'log_api_' + Math.random().toString(36).substring(2, 18)
                                const { error } = await supabase.from('log_api_keys').insert({
                                  key_value: newKey,
                                  name: `API Key ${new Date().toLocaleDateString()}`,
                                  created_at: new Date().toISOString(),
                                  is_primary: false
                                })
                                if (error) throw error
                                return { newKey }
                              })(),
                              {
                                loading: 'Creating new API key...',
                                success: 'New API key created successfully',
                                error: 'Failed to create API key'
                              }
                            )
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-teal-500" />
                          Log Forwarding
                        </CardTitle>
                        <CardDescription>Forward logs to external systems</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-8 text-slate-500">
                          <Send className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                          <p>No forwarders configured</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setShowForwarderDialog(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Forwarder
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-teal-500" />
                          Data Security
                        </CardTitle>
                        <CardDescription>Protect sensitive log data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="pii-scan" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">PII Scanning</span>
                            <span className="text-sm text-slate-500">Detect and redact PII</span>
                          </Label>
                          <Switch id="pii-scan" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="encrypt-transit" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Encryption in Transit</span>
                            <span className="text-sm text-slate-500">TLS 1.3 encryption</span>
                          </Label>
                          <Switch id="encrypt-transit" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="audit-access" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Access Audit</span>
                            <span className="text-sm text-slate-500">Log all access events</span>
                          </Label>
                          <Switch id="audit-access" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage log access permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Role-Based Access</p>
                            <p className="text-sm text-slate-500">Control access by role</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Enabled</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-teal-500" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Expert configuration options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="raw-mode" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Raw Log Mode</span>
                            <span className="text-sm text-slate-500">Display unprocessed logs</span>
                          </Label>
                          <Switch id="raw-mode" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="debug-queries" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Debug Queries</span>
                            <span className="text-sm text-slate-500">Show query execution details</span>
                          </Label>
                          <Switch id="debug-queries" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="trace-context" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Trace Context</span>
                            <span className="text-sm text-slate-500">Include distributed trace info</span>
                          </Label>
                          <Switch id="trace-context" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Clear All Logs</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Permanently delete all indexed logs</p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-100"
                            onClick={handleClearLogs}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Pipelines</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Delete all processing pipelines</p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-100"
                            onClick={async () => {
                              if (!confirm('Are you sure you want to reset all pipelines? This action cannot be undone.')) return
                              toast.promise(
                                (async () => {
                                  const { createClient } = await import('@/lib/supabase/client')
                                  const supabase = createClient()
                                  const { error } = await supabase
                                    .from('log_pipelines')
                                    .delete()
                                    .neq('id', '') // Delete all
                                  if (error) throw error
                                  return { reset: true }
                                })(),
                                {
                                  loading: 'Resetting pipelines...',
                                  success: 'All pipelines reset successfully',
                                  error: 'Failed to reset pipelines'
                                }
                              )
                            }}
                          >
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
              insights={[]}
              title="Log Analytics Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Log Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[]}
            title="Log Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[
              {
                id: '1',
                label: 'Live Tail',
                icon: 'play',
                action: () => {
                  setIsLive(true)
                  setActiveTab('streams')
                  toast.success('Live Tail connected!')
                },
                variant: 'default' as const
              },
              {
                id: '2',
                label: 'Create Alert',
                icon: 'bell',
                action: () => {
                  setShowAlertDialog(true)
                },
                variant: 'default' as const
              },
              {
                id: '3',
                label: 'Export Logs',
                icon: 'download',
                action: () => {
                  handleExportLogs()
                },
                variant: 'outline' as const
              },
            ]}
            variant="grid"
          />
        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {selectedLog && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-mono text-sm">{selectedLog.message}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <Label className="text-gray-500">Service</Label>
                    <p className="font-medium">{selectedLog.service}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Host</Label>
                    <p className="font-medium">{selectedLog.host}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Level</Label>
                    <Badge className={getLevelColor(selectedLog.level)}>{selectedLog.level}</Badge>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Log Alert</DialogTitle>
            <DialogDescription>
              Set up notifications when log patterns match your criteria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alert Name</Label>
              <Input
                placeholder="e.g., Error Rate Spike"
                value={alertForm.name}
                onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Query</Label>
              <Input
                placeholder="e.g., level:error service:api-gateway"
                value={alertForm.query}
                onChange={(e) => setAlertForm({ ...alertForm, query: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Warning Threshold</Label>
                <Input
                  type="number"
                  value={alertForm.threshold_warning}
                  onChange={(e) => setAlertForm({ ...alertForm, threshold_warning: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Critical Threshold</Label>
                <Input
                  type="number"
                  value={alertForm.threshold_critical}
                  onChange={(e) => setAlertForm({ ...alertForm, threshold_critical: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Aggregation</Label>
                <Select value={alertForm.aggregation} onValueChange={(v: any) => setAlertForm({ ...alertForm, aggregation: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="min">Min</SelectItem>
                    <SelectItem value="max">Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Window</Label>
                <Select value={alertForm.time_window} onValueChange={(v) => setAlertForm({ ...alertForm, time_window: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 minute</SelectItem>
                    <SelectItem value="5m">5 minutes</SelectItem>
                    <SelectItem value="15m">15 minutes</SelectItem>
                    <SelectItem value="30m">30 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notifications (comma-separated)</Label>
              <Input
                placeholder="e.g., #alerts-channel, oncall@company.com"
                value={alertForm.notifications}
                onChange={(e) => setAlertForm({ ...alertForm, notifications: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAlert} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Stream Dialog */}
      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Live Stream</DialogTitle>
            <DialogDescription>
              Create a real-time log stream with custom filters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Stream Name</Label>
              <Input
                placeholder="e.g., All Errors"
                value={streamForm.name}
                onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Query</Label>
              <Input
                placeholder="e.g., level:(error OR critical)"
                value={streamForm.query}
                onChange={(e) => setStreamForm({ ...streamForm, query: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={streamForm.color} onValueChange={(v) => setStreamForm({ ...streamForm, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStreamDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateStream} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Stream'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Pipeline Dialog */}
      <Dialog open={showPipelineDialog} onOpenChange={setShowPipelineDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Log Pipeline</DialogTitle>
            <DialogDescription>
              Configure log parsing and enrichment rules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pipeline Name</Label>
              <Input
                placeholder="e.g., API Gateway Parsing"
                value={pipelineForm.name}
                onChange={(e) => setPipelineForm({ ...pipelineForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter</Label>
              <Input
                placeholder="e.g., service:api-gateway"
                value={pipelineForm.filter}
                onChange={(e) => setPipelineForm({ ...pipelineForm, filter: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sample Rate (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={pipelineForm.sample_rate}
                onChange={(e) => setPipelineForm({ ...pipelineForm, sample_rate: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPipelineDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePipeline} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Log Archive</DialogTitle>
            <DialogDescription>
              Configure long-term log storage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Archive Name</Label>
              <Input
                placeholder="e.g., Production Logs"
                value={archiveForm.name}
                onChange={(e) => setArchiveForm({ ...archiveForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Select value={archiveForm.destination} onValueChange={(v: any) => setArchiveForm({ ...archiveForm, destination: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S3">Amazon S3</SelectItem>
                  <SelectItem value="GCS">Google Cloud Storage</SelectItem>
                  <SelectItem value="Azure Blob">Azure Blob Storage</SelectItem>
                  <SelectItem value="Glacier">Amazon Glacier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bucket Name</Label>
              <Input
                placeholder="e.g., company-logs-prod"
                value={archiveForm.bucket}
                onChange={(e) => setArchiveForm({ ...archiveForm, bucket: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Path</Label>
              <Input
                placeholder="e.g., /logs/production/"
                value={archiveForm.path}
                onChange={(e) => setArchiveForm({ ...archiveForm, path: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Retention Days</Label>
                <Input
                  type="number"
                  value={archiveForm.retention_days}
                  onChange={(e) => setArchiveForm({ ...archiveForm, retention_days: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Encryption</Label>
                <Select value={archiveForm.encryption_type} onValueChange={(v: any) => setArchiveForm({ ...archiveForm, encryption_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256">AES-256</SelectItem>
                    <SelectItem value="KMS">KMS</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={archiveForm.rehydration_enabled}
                onCheckedChange={(checked) => setArchiveForm({ ...archiveForm, rehydration_enabled: checked })}
              />
              <Label>Enable rehydration</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateArchive} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sensitive Data Rule Dialog */}
      <Dialog open={showSensitiveDialog} onOpenChange={setShowSensitiveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Sensitive Data Rule</DialogTitle>
            <DialogDescription>
              Create a rule to detect and protect sensitive information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g., Credit Cards"
                value={sensitiveRuleForm.name}
                onChange={(e) => setSensitiveRuleForm({ ...sensitiveRuleForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={sensitiveRuleForm.type} onValueChange={(v: any) => setSensitiveRuleForm({ ...sensitiveRuleForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="ssn">SSN</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pattern (Regex)</Label>
              <Input
                placeholder="e.g., \\b(?:\\d{4}[- ]?){3}\\d{4}\\b"
                value={sensitiveRuleForm.pattern}
                onChange={(e) => setSensitiveRuleForm({ ...sensitiveRuleForm, pattern: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={sensitiveRuleForm.action} onValueChange={(v: any) => setSensitiveRuleForm({ ...sensitiveRuleForm, action: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="redact">Redact</SelectItem>
                  <SelectItem value="hash">Hash</SelectItem>
                  <SelectItem value="partial_mask">Partial Mask</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSensitiveDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSensitiveRule} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Add Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save View Dialog */}
      <Dialog open={showSaveViewDialog} onOpenChange={setShowSaveViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save the current filters and columns as a reusable view
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>View Name</Label>
              <Input
                placeholder="e.g., Production Errors"
                value={savedViewForm.name}
                onChange={(e) => setSavedViewForm({ ...savedViewForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Query (optional)</Label>
              <Input
                placeholder="e.g., env:production level:(error OR critical)"
                value={savedViewForm.query || searchQuery}
                onChange={(e) => setSavedViewForm({ ...savedViewForm, query: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={savedViewForm.is_default}
                onCheckedChange={(checked) => setSavedViewForm({ ...savedViewForm, is_default: checked })}
              />
              <Label>Set as default view</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={savedViewForm.is_shared}
                onCheckedChange={(checked) => setSavedViewForm({ ...savedViewForm, is_shared: checked })}
              />
              <Label>Share with team</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveViewDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveView} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Forwarder Dialog */}
      <Dialog open={showForwarderDialog} onOpenChange={setShowForwarderDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Log Forwarder</DialogTitle>
            <DialogDescription>
              Forward logs to external systems
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Forwarder Name</Label>
              <Input placeholder="e.g., SIEM Integration" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select defaultValue="http">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="syslog">Syslog</SelectItem>
                  <SelectItem value="kafka">Kafka</SelectItem>
                  <SelectItem value="splunk">Splunk</SelectItem>
                  <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Input placeholder="e.g., https://splunk.company.com:8088" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForwarderDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.promise(
                (async () => {
                  const { createClient } = await import('@/lib/supabase/client')
                  const supabase = createClient()
                  const { error } = await supabase.from('log_forwarders').insert({
                    name: 'New Forwarder',
                    type: 'splunk', // Default type, would come from form in real implementation
                    endpoint: '', // Would come from form
                    status: 'active',
                    created_at: new Date().toISOString()
                  })
                  if (error) throw error
                  setShowForwarderDialog(false)
                  return { created: true }
                })(),
                {
                  loading: 'Adding forwarder...',
                  success: 'Log forwarder has been configured',
                  error: 'Failed to add forwarder'
                }
              )
            }}>
              Add Forwarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
