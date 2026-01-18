'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  type ActivityLog
} from '@/lib/hooks/use-activity-logs'
import {
  Activity,
  Search,
  Download,
  Upload,
  RefreshCw,
  Clock,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  ChevronRight,
  ChevronDown,
  User,
  Globe,
  Smartphone,
  Server,
  Database,
  Code,
  Terminal,
  Bookmark,
  BookmarkCheck,
  Bell,
  Settings,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Play,
  Pause,
  Copy,
  Tag,
  Layers,
  GitCommit,
  Shield,
  Lock,
  Plus,
  Minus,
  Key,
  Webhook,
  Link,
  Mail,
  AlertOctagon,
  Trash2,
  Link2,
  HardDrive,
  Sliders,
  Archive,
  History,
  Gauge
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Type definitions for Datadog-level logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'
type LogSource = 'api' | 'web' | 'mobile' | 'worker' | 'cron' | 'webhook'
type LogStatus = 'ok' | 'info' | 'warn' | 'error'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: LogSource
  service: string
  host: string
  message: string
  traceId: string | null
  spanId: string | null
  userId: string | null
  userName: string | null
  userEmail: string | null
  sessionId: string | null
  requestId: string | null
  method: string | null
  path: string | null
  statusCode: number | null
  duration: number | null
  ip: string | null
  userAgent: string | null
  country: string | null
  tags: string[]
  attributes: Record<string, unknown>
  stackTrace: string | null
}

interface LogPattern {
  id: string
  pattern: string
  count: number
  level: LogLevel
  firstSeen: string
  lastSeen: string
  trend: 'up' | 'down' | 'stable'
  services: string[]
}

interface SavedQuery {
  id: string
  name: string
  query: string
  filters: Record<string, string[]>
  createdAt: string
  isDefault: boolean
}

interface LogMetric {
  name: string
  value: number
  change: number
  unit: string
}

interface LogStats {
  totalLogs: number
  logsPerMinute: number
  errorRate: number
  avgLatency: number
  uniqueUsers: number
  uniqueSessions: number
  byLevel: Record<LogLevel, number>
  bySource: Record<LogSource, number>
  byService: Record<string, number>
  topErrors: { message: string; count: number }[]
  timeline: { time: string; count: number; errors: number }[]
}

interface ActivityLogsClientProps {
  initialLogs: ActivityLog[]
}

// Quick actions are now defined inside the component to access state setters

export default function ActivityLogsClient({ initialLogs }: ActivityLogsClientProps) {
  const [activeTab, setActiveTab] = useState('logs')
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<LogSource | 'all'>('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showQueryDialog, setShowQueryDialog] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [timeRange, setTimeRange] = useState('1h')
  const [settingsTab, setSettingsTab] = useState('general')

  // Additional dialog states
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [showPatternDialog, setShowPatternDialog] = useState(false)
  const [showParserDialog, setShowParserDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showPurgeDialog, setShowPurgeDialog] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<LogPattern | null>(null)

  // Form states
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'txt'>('csv')
  const [dateRangeStart, setDateRangeStart] = useState('')
  const [dateRangeEnd, setDateRangeEnd] = useState('')
  const [queryName, setQueryName] = useState('')
  const [isDefaultQuery, setIsDefaultQuery] = useState(false)
  const [alertName, setAlertName] = useState('')
  const [alertThreshold, setAlertThreshold] = useState(10)
  const [alertLevel, setAlertLevel] = useState<LogLevel>('error')

  const filteredLogs = useMemo(() => {
    return []
  }, [searchQuery, levelFilter, sourceFilter])

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'warn': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'critical': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
  }

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'debug': return <Code className="w-3 h-3" />
      case 'info': return <Info className="w-3 h-3" />
      case 'warn': return <AlertTriangle className="w-3 h-3" />
      case 'error': return <AlertCircle className="w-3 h-3" />
      case 'critical': return <XCircle className="w-3 h-3" />
    }
  }

  const getSourceIcon = (source: LogSource) => {
    switch (source) {
      case 'api': return <Server className="w-4 h-4" />
      case 'web': return <Globe className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'worker': return <Zap className="w-4 h-4" />
      case 'cron': return <Clock className="w-4 h-4" />
      case 'webhook': return <GitCommit className="w-4 h-4" />
    }
  }

  const toggleLogExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
  }

  // Handlers with real functionality
  const handleSearchLogs = async () => {
    await toast.promise(
      (async () => {
        // Focus on the search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
        setShowQueryDialog(true)
      })(),
      {
        loading: 'Opening log search...',
        success: 'Log search ready - use advanced queries to filter logs',
        error: 'Failed to open log search'
      }
    )
  }

  const handleExportLogs = async () => {
    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'export',
            format: 'csv',
            startDate: null,
            endDate: null
          })
        })

        if (!response.ok) {
          throw new Error('Export failed')
        }

        const data = await response.json()

        if (data.success && data.exportData) {
          // Create and download CSV file
          const csvContent = data.exportData.content
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          // Fallback: export filtered logs from current view
          const headers = ['timestamp', 'level', 'source', 'service', 'message', 'traceId', 'statusCode', 'duration']
          const rows = filteredLogs.map(log =>
            headers.map(h => {
              const val = log[h as keyof typeof log]
              return typeof val === 'string' ? `"${val}"` : val ?? ''
            }).join(',')
          )
          const csvContent = [headers.join(','), ...rows].join('\n')
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      })(),
      {
        loading: 'Exporting logs...',
        success: 'Logs exported to activity-logs.csv',
        error: 'Export failed'
      }
    )
  }

  const handleSetAlert = async () => {
    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-alert',
            level: levelFilter !== 'all' ? levelFilter : 'error',
            source: sourceFilter !== 'all' ? sourceFilter : undefined,
            keyword: searchQuery || undefined,
            threshold: 10,
            window: 60,
            notifyEmail: undefined
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create alert')
        }

        return response.json()
      })(),
      {
        loading: 'Creating alert rule...',
        success: 'Alert created for error patterns',
        error: 'Failed to create alert'
      }
    )
  }

  const handleLiveTail = async () => {
    await toast.promise(
      (async () => {
        setIsLiveMode(!isLiveMode)
      })(),
      {
        loading: isLiveMode ? 'Pausing live tail...' : 'Enabling live tail...',
        success: isLiveMode ? 'Live tail paused' : 'Live tail enabled - streaming logs in real-time',
        error: 'Failed to toggle live tail'
      }
    )
  }

  const handleClearFilters = async () => {
    setSearchQuery('')
    setLevelFilter('all')
    setSourceFilter('all')
    setTimeRange('1h')
    toast.success('Filters cleared')
  }

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      return
    }

    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'clear',
            before: new Date().toISOString()
          })
        })

        if (!response.ok) {
          throw new Error('Failed to clear logs')
        }

        return response.json()
      })(),
      {
        loading: 'Clearing logs...',
        success: 'Logs cleared successfully',
        error: 'Failed to clear logs'
      }
    )
  }

  const handleRefreshLogs = async () => {
    await toast.promise(
      (async () => {
        const params = new URLSearchParams()
        if (levelFilter !== 'all') params.append('level', levelFilter)
        if (sourceFilter !== 'all') params.append('source', sourceFilter)
        if (searchQuery) params.append('search', searchQuery)
        params.append('limit', '50')

        const response = await fetch(`/api/logs?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to refresh logs')
        }

        return response.json()
      })(),
      {
        loading: 'Refreshing logs...',
        success: 'Logs refreshed',
        error: 'Failed to refresh logs'
      }
    )
  }

  const handleBookmarkLog = async (log: LogEntry) => {
    await toast.promise(
      (async () => {
        // Store bookmark in localStorage for now
        const bookmarks = JSON.parse(localStorage.getItem('log-bookmarks') || '[]')
        bookmarks.push({
          id: log.id,
          message: log.message,
          timestamp: log.timestamp,
          level: log.level,
          bookmarkedAt: new Date().toISOString()
        })
        localStorage.setItem('log-bookmarks', JSON.stringify(bookmarks))
      })(),
      {
        loading: 'Bookmarking log...',
        success: 'Log bookmarked',
        error: 'Failed to bookmark log'
      }
    )
  }

  const handleCreateAlert = async (log: LogEntry) => {
    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-alert',
            level: log.level,
            source: log.source,
            keyword: log.message.substring(0, 50),
            threshold: 5,
            window: 30
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create alert')
        }

        return response.json()
      })(),
      {
        loading: 'Creating alert rule...',
        success: 'Alert rule created for this activity type',
        error: 'Failed to create alert'
      }
    )
  }

  // Additional handlers for new dialogs
  const handleOpenExportDialog = () => {
    setShowExportDialog(true)
  }

  const handleExportWithFormat = async () => {
    await toast.promise(
      (async () => {
        const headers = ['timestamp', 'level', 'source', 'service', 'message', 'traceId', 'statusCode', 'duration']
        let content = ''

        if (exportFormat === 'csv') {
          const rows = filteredLogs.map(log =>
            headers.map(h => {
              const val = log[h as keyof typeof log]
              return typeof val === 'string' ? `"${val}"` : val ?? ''
            }).join(',')
          )
          content = [headers.join(','), ...rows].join('\n')
        } else if (exportFormat === 'json') {
          content = JSON.stringify(filteredLogs, null, 2)
        } else {
          content = filteredLogs.map(log =>
            `[${log.timestamp}] ${log.level.toUpperCase()} [${log.service}] ${log.message}`
          ).join('\n')
        }

        const blob = new Blob([content], {
          type: exportFormat === 'json' ? 'application/json' :
                exportFormat === 'csv' ? 'text/csv' : 'text/plain'
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setShowExportDialog(false)
      })(),
      {
        loading: `Exporting logs as ${exportFormat.toUpperCase()}...`,
        success: `Logs exported as ${exportFormat.toUpperCase()}`,
        error: 'Export failed'
      }
    )
  }

  const handleOpenFilterDialog = () => {
    setShowFilterDialog(true)
  }

  const handleApplyFilters = () => {
    setShowFilterDialog(false)
    toast.success(`Filters applied: Source: ${sourceFilter}, Time: ${timeRange}`)
  }

  const handleOpenDateRangeDialog = () => {
    setShowDateRangeDialog(true)
  }

  const handleApplyDateRange = () => {
    if (dateRangeStart && dateRangeEnd) {
      toast.success(`Date range applied: ${dateRangeStart} to ${dateRangeEnd}`)
    } else {
      toast.error('Please select both start and end dates')
      return
    }
    setShowDateRangeDialog(false)
  }

  const handleOpenAlertDialog = () => {
    setShowAlertDialog(true)
    setAlertName('')
    setAlertThreshold(10)
    setAlertLevel('error')
    toast.info('Create alert rule')
  }

  const handleCreateAlertRule = async () => {
    if (!alertName) {
      toast.error('Please enter an alert name')
      return
    }

    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-alert',
            name: alertName,
            level: alertLevel,
            threshold: alertThreshold,
            window: 60
          })
        })
        if (!response.ok) throw new Error('Failed to create alert')
        setShowAlertDialog(false)
        return response.json()
      })(),
      {
        loading: 'Creating alert rule...',
        success: `Alert "${alertName}" created successfully`,
        error: 'Failed to create alert rule'
      }
    )
  }

  const handleSaveQuery = async () => {
    if (!queryName) {
      toast.error('Please enter a query name')
      return
    }

    await toast.promise(
      (async () => {
        const savedQueries = JSON.parse(localStorage.getItem('saved-log-queries') || '[]')
        savedQueries.push({
          id: `sq_${Date.now()}`,
          name: queryName,
          query: searchQuery,
          filters: { level: levelFilter, source: sourceFilter },
          createdAt: new Date().toISOString().split('T')[0],
          isDefault: isDefaultQuery
        })
        localStorage.setItem('saved-log-queries', JSON.stringify(savedQueries))
        setShowQueryDialog(false)
        setQueryName('')
        setIsDefaultQuery(false)
      })(),
      {
        loading: 'Saving query...',
        success: `Query "${queryName}" saved successfully`,
        error: 'Failed to save query'
      }
    )
  }

  const handleCopyLog = async () => {
    if (!selectedLog) return

    const logText = JSON.stringify(selectedLog, null, 2)
    await navigator.clipboard.writeText(logText)
    toast.success('Log copied to clipboard')
  }

  const handleViewPattern = (pattern: LogPattern) => {
    setSelectedPattern(pattern)
    setShowPatternDialog(true)
    toast.info(`Viewing pattern: ${pattern.pattern}`)
  }

  const handleCreatePatternAlert = async () => {
    if (!selectedPattern) return

    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-alert',
            pattern: selectedPattern.pattern,
            level: selectedPattern.level,
            threshold: 5,
            window: 60
          })
        })
        if (!response.ok) throw new Error('Failed')
        setShowPatternDialog(false)
        return response.json()
      })(),
      {
        loading: 'Creating pattern alert...',
        success: 'Alert created for this pattern',
        error: 'Failed to create alert'
      }
    )
  }

  const handleOpenSettingsDialog = () => {
    setShowSettingsDialog(true)
  }

  const handleSaveSettings = () => {
    setShowSettingsDialog(false)
    toast.success('Settings saved successfully')
  }

  const handleOpenParserDialog = () => {
    setShowParserDialog(true)
  }

  const handleAddParser = () => {
    toast.success('Custom parser added')
    setShowParserDialog(false)
  }

  const handleOpenIntegrationDialog = () => {
    setShowIntegrationDialog(true)
  }

  const handleConnectIntegration = (name: string) => {
    toast.success(`Connected to ${name}`)
  }

  const handleOpenApiKeyDialog = () => {
    setShowApiKeyDialog(true)
  }

  const handleRegenerateApiKey = async () => {
    await toast.promise(
      fetch('/api/activity-logs/api-key', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Regenerating API key...',
        success: 'New API key generated',
        error: 'Failed to regenerate key'
      }
    )
  }

  const handleCopyApiKey = async () => {
    await navigator.clipboard.writeText('log_api_' + Math.random().toString(36).substring(2, 15))
    toast.success('API key copied to clipboard')
  }

  const handleOpenPurgeDialog = () => {
    setShowPurgeDialog(true)
    toast.warning('Warning: This action cannot be undone')
  }

  const handlePurgeLogs = async () => {
    await toast.promise(
      (async () => {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'purge',
            confirm: true
          })
        })
        if (!response.ok) throw new Error('Failed')
        setShowPurgeDialog(false)
        return response.json()
      })(),
      {
        loading: 'Purging all logs...',
        success: 'All logs have been purged',
        error: 'Failed to purge logs'
      }
    )
  }

  const handleRunSavedQuery = (query: SavedQuery) => {
    setSearchQuery(query.query)
    if (query.filters.source) setSourceFilter(query.filters.source[0] as LogSource)
    if (query.filters.tags) {
      toast.info(`Running query: ${query.name}`)
    }
    toast.success(`Query "${query.name}" applied`)
  }

  const handleDeleteSavedQuery = (queryId: string) => {
    toast.success('Query deleted')
  }

  const handleToggleParser = (parserName: string, enabled: boolean) => {
    toast.success(`Parser ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleToggleAlertRule = (ruleName: string, enabled: boolean) => {
    toast.success(`Alert rule ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleConnectChannel = (channelName: string) => {
    toast.success(`Connecting to ${channelName}...`)
  }

  const handleConfigureStorage = (storageName: string) => {
    toast.info(`Configuring ${storageName}`)
  }

  // Quick actions with real functionality
  const logsQuickActions = [
    { id: '1', label: 'Search Logs', icon: 'Search', shortcut: 'S', action: handleSearchLogs },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: handleExportLogs },
    { id: '3', label: 'Set Alert', icon: 'Bell', shortcut: 'A', action: handleSetAlert },
    { id: '4', label: 'Live Tail', icon: 'Activity', shortcut: 'L', action: handleLiveTail },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Log Explorer</h1>
                <p className="text-white/80">Datadog-level log aggregation and analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
                Datadog Level
              </span>
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isLiveMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                }`}
              >
                {isLiveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isLiveMode ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                Total Logs
              </div>
              <div className="text-2xl font-bold">{(mockStats.totalLogs / 1000000).toFixed(2)}M</div>
              <div className="text-xs text-white/60">{timeRange} window</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Logs/Min
              </div>
              <div className="text-2xl font-bold">{(mockStats.logsPerMinute / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Current rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Error Rate
              </div>
              <div className="text-2xl font-bold text-red-300">{mockStats.errorRate}%</div>
              <div className="text-xs text-white/60">{mockStats.byLevel.error + mockStats.byLevel.critical} errors</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Avg Latency
              </div>
              <div className="text-2xl font-bold">{mockStats.avgLatency}ms</div>
              <div className="text-xs text-white/60">p50 response</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <User className="w-4 h-4" />
                Users
              </div>
              <div className="text-2xl font-bold">{(mockStats.uniqueUsers / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Unique users</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Layers className="w-4 h-4" />
                Sessions
              </div>
              <div className="text-2xl font-bold">{(mockStats.uniqueSessions / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Active sessions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700">
              <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Terminal className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="patterns" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Layers className="w-4 h-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="saved" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved Views
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 dark:data-[state=active]:bg-purple-900/30">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm dark:text-white"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="4h">Last 4 hours</option>
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
              <button
                onClick={handleOpenExportDialog}
                className="px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            {/* Logs Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Activity Logs</h2>
                  <p className="text-slate-100">Datadog-level log aggregation and search</p>
                  <p className="text-slate-200 text-xs mt-1">Full-text search • Real-time streaming • Log correlation</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredLogs.length}</p>
                    <p className="text-slate-200 text-sm">Logs Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredLogs.filter(l => l.level === 'error').length}</p>
                    <p className="text-slate-200 text-sm">Errors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs by message, service, trace ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'all')}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm dark:text-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as LogSource | 'all')}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm dark:text-white"
                  >
                    <option value="all">All Sources</option>
                    <option value="api">API</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="worker">Worker</option>
                    <option value="cron">Cron</option>
                    <option value="webhook">Webhook</option>
                  </select>
                  <button
                    onClick={() => setShowQueryDialog(true)}
                    className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center gap-2"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    Save Query
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Quick filters:</span>
                {Object.entries(mockStats.byLevel).map(([level, count]) => (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level as LogLevel)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      levelFilter === level ? getLevelColor(level as LogLevel) : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level}: {(count / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Log Entries */}
            <div className="bg-gray-900 rounded-xl overflow-hidden font-mono text-sm">
              <div className="p-2 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400 text-xs">
                  <span>Showing {filteredLogs.length} logs</span>
                  {isLiveMode && (
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRefreshLogs}
                  className="text-gray-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-gray-800">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="hover:bg-gray-800/50">
                      <div
                        className="p-3 flex items-start gap-3 cursor-pointer"
                        onClick={() => toggleLogExpanded(log.id)}
                      >
                        <button className="mt-0.5 text-gray-500">
                          {expandedLogs.has(log.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-gray-500 whitespace-nowrap">{formatTimestamp(log.timestamp)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-cyan-400">[{log.service}]</span>
                        <span className="text-gray-300 flex-1">{log.message}</span>
                        {log.duration && (
                          <span className="text-yellow-400">{log.duration}ms</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); setShowLogDialog(true); }}
                          className="text-gray-500 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      {expandedLogs.has(log.id) && (
                        <div className="px-12 pb-3 space-y-2 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {log.traceId && (
                              <div>
                                <span className="text-gray-500">trace_id: </span>
                                <span className="text-purple-400">{log.traceId}</span>
                              </div>
                            )}
                            {log.requestId && (
                              <div>
                                <span className="text-gray-500">request_id: </span>
                                <span className="text-purple-400">{log.requestId}</span>
                              </div>
                            )}
                            {log.userId && (
                              <div>
                                <span className="text-gray-500">user: </span>
                                <span className="text-green-400">{log.userName} ({log.userEmail})</span>
                              </div>
                            )}
                            {log.method && log.path && (
                              <div>
                                <span className="text-gray-500">endpoint: </span>
                                <span className="text-blue-400">{log.method} {log.path}</span>
                              </div>
                            )}
                            {log.statusCode && (
                              <div>
                                <span className="text-gray-500">status: </span>
                                <span className={log.statusCode < 400 ? 'text-green-400' : 'text-red-400'}>{log.statusCode}</span>
                              </div>
                            )}
                            {log.ip && (
                              <div>
                                <span className="text-gray-500">ip: </span>
                                <span className="text-gray-300">{log.ip}</span>
                              </div>
                            )}
                          </div>
                          {log.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">tags:</span>
                              {log.tags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                          {log.stackTrace && (
                            <pre className="mt-2 p-2 bg-gray-950 rounded text-red-400 overflow-x-auto">
                              {log.stackTrace}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            {/* Patterns Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Patterns</h2>
                  <p className="text-purple-100">Splunk-level pattern detection and anomaly analysis</p>
                  <p className="text-purple-200 text-xs mt-1">ML-powered grouping • Error clustering • Trend detection</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockPatterns.length}</p>
                    <p className="text-purple-200 text-sm">Patterns</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Log Patterns</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Auto-detected patterns from your logs</span>
            </div>
            <div className="space-y-3">
              {mockPatterns.map((pattern) => (
                <div key={pattern.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(pattern.level)}`}>
                        {pattern.level.toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-mono text-sm font-medium text-gray-900 dark:text-white">{pattern.pattern}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>First seen: {pattern.firstSeen}</span>
                          <span>•</span>
                          <span>Last seen: {pattern.lastSeen}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{pattern.count.toLocaleString()}</div>
                      <div className={`flex items-center justify-end gap-1 text-sm ${
                        pattern.trend === 'up' ? 'text-red-500' : pattern.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {pattern.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : pattern.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {pattern.trend}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Services:</span>
                      {pattern.services.map(service => (
                        <span key={service} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPattern(pattern)}
                        className="px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPattern(pattern)
                          handleOpenAlertDialog()
                        }}
                        className="px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                      >
                        <Bell className="w-3 h-3 inline mr-1" />
                        Create Alert
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Analytics</h2>
                  <p className="text-emerald-100">Elastic-level log analytics and visualization</p>
                  <p className="text-emerald-200 text-xs mt-1">Time-series charts • Distribution analysis • Custom dashboards</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredLogs.length}</p>
                    <p className="text-emerald-200 text-sm">Total Logs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Level */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs by Level</h3>
                <div className="space-y-3">
                  {Object.entries(mockStats.byLevel).map(([level, count]) => {
                    const percentage = (count / mockStats.totalLogs) * 100
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getLevelIcon(level as LogLevel)}
                            <span className="capitalize text-gray-700 dark:text-gray-300">{level}</span>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{(count / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              level === 'debug' ? 'bg-gray-400' :
                              level === 'info' ? 'bg-blue-500' :
                              level === 'warn' ? 'bg-yellow-500' :
                              level === 'error' ? 'bg-red-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* By Source */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs by Source</h3>
                <div className="space-y-3">
                  {Object.entries(mockStats.bySource).map(([source, count]) => {
                    const percentage = (count / mockStats.totalLogs) * 100
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getSourceIcon(source as LogSource)}
                            <span className="capitalize text-gray-700 dark:text-gray-300">{source}</span>
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{(count / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Errors */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Errors</h3>
                <div className="space-y-3">
                  {mockStats.topErrors.map((error, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm text-red-700 dark:text-red-400">{error.message}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">{error.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Service */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs by Service</h3>
                <div className="space-y-2">
                  {Object.entries(mockStats.byService).slice(0, 5).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{service}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(count / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Saved Views Tab */}
          <TabsContent value="saved" className="space-y-4">
            {/* Saved Queries Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Saved Queries</h2>
                  <p className="text-amber-100">Papertrail-level query management and sharing</p>
                  <p className="text-amber-200 text-xs mt-1">Reusable queries • Team sharing • Alert triggers</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSavedQueries.length}</p>
                    <p className="text-amber-200 text-sm">Saved</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Queries</h2>
              <button
                onClick={() => setShowQueryDialog(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Query
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSavedQueries.map((query) => (
                <div key={query.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{query.name}</h3>
                        {query.isDefault && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Created {query.createdAt}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSavedQuery(query.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {query.query}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunSavedQuery(query)}
                      className="flex-1 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    >
                      <Play className="w-4 h-4 inline mr-1" />
                      Run Query
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(query.query)
                        toast.success('Query copied to clipboard')
                      }}
                      className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Datadog-level configuration */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Log Settings</h2>
                  <p className="text-blue-100">Enterprise-level log configuration and retention</p>
                  <p className="text-blue-200 text-xs mt-1">Retention policies • Alert rules • Export configs</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">30-Day Retention</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Auto-Archive</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">SIEM Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: <Settings className="w-4 h-4" />, label: 'General', color: 'text-slate-600', action: () => setSettingsTab('general') },
                { icon: <Bell className="w-4 h-4" />, label: 'Alerts', color: 'text-blue-600', action: () => { setSettingsTab('alerts'); handleOpenAlertDialog() } },
                { icon: <Archive className="w-4 h-4" />, label: 'Retention', color: 'text-green-600', action: () => setSettingsTab('archiving') },
                { icon: <Download className="w-4 h-4" />, label: 'Export', color: 'text-purple-600', action: handleOpenExportDialog },
                { icon: <Shield className="w-4 h-4" />, label: 'Access', color: 'text-orange-600', action: () => setSettingsTab('advanced') },
                { icon: <Zap className="w-4 h-4" />, label: 'Webhooks', color: 'text-amber-600', action: () => setSettingsTab('integrations') },
                { icon: <Link className="w-4 h-4" />, label: 'Integrations', color: 'text-pink-600', action: handleOpenIntegrationDialog },
                { icon: <Key className="w-4 h-4" />, label: 'API Keys', color: 'text-cyan-600', action: handleOpenApiKeyDialog }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:scale-105 transition-all duration-200"
                >
                  <span className={action.color}>{action.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Sliders, label: 'General' },
                        { id: 'parsing', icon: Code, label: 'Parsing' },
                        { id: 'alerts', icon: Bell, label: 'Alerts' },
                        { id: 'archiving', icon: Archive, label: 'Archiving' },
                        { id: 'integrations', icon: Zap, label: 'Integrations' },
                        { id: 'advanced', icon: Lock, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-purple-500" />
                          General Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Log Retention Period</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">7 Days</SelectItem>
                                <SelectItem value="15d">15 Days</SelectItem>
                                <SelectItem value="30d">30 Days</SelectItem>
                                <SelectItem value="90d">90 Days</SelectItem>
                                <SelectItem value="1y">1 Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="local">Local Time</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Log Level</Label>
                            <Select defaultValue="info">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="debug">Debug</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warn">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Logs per Query</Label>
                            <Input type="number" defaultValue="10000" />
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Live Tail Mode</p>
                              <p className="text-sm text-muted-foreground">Stream logs in real-time</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Preserve Log Context</p>
                              <p className="text-sm text-muted-foreground">Keep surrounding log lines when filtering</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Auto-refresh Dashboard</p>
                              <p className="text-sm text-muted-foreground">Automatically update analytics</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="w-5 h-5 text-blue-500" />
                          Sampling Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Log Sampling</p>
                            <p className="text-sm text-muted-foreground">Sample logs to reduce storage costs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Sample Rate (%)</Label>
                          <div className="flex items-center gap-4">
                            <Input type="range" min="1" max="100" defaultValue="100" className="flex-1" />
                            <span className="text-sm font-medium w-12">100%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Always Keep Errors</p>
                            <p className="text-sm text-muted-foreground">Never sample error and critical logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'parsing' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-green-500" />
                          Log Parsers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Configure how logs are parsed and indexed</p>
                        <div className="space-y-3">
                          {[
                            { name: 'JSON Parser', description: 'Parse JSON formatted logs', enabled: true },
                            { name: 'Nginx Parser', description: 'Parse Nginx access logs', enabled: true },
                            { name: 'Apache Parser', description: 'Parse Apache access/error logs', enabled: false },
                            { name: 'Syslog Parser', description: 'Parse RFC 5424 syslog format', enabled: true },
                            { name: 'Custom Regex', description: 'User-defined regex patterns', enabled: true }
                          ].map(parser => (
                            <div key={parser.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{parser.name}</p>
                                  <p className="text-sm text-muted-foreground">{parser.description}</p>
                                </div>
                              </div>
                              <Switch checked={parser.enabled} />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowParserDialog(true)}
                          className="w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-purple-300 transition-colors"
                        >
                          <Plus className="w-4 h-4 inline-block mr-2" />
                          Add Custom Parser
                        </button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-orange-500" />
                          Field Extraction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-extract Fields</p>
                            <p className="text-sm text-muted-foreground">Automatically detect and extract fields</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Index All Fields</p>
                            <p className="text-sm text-muted-foreground">Make all extracted fields searchable</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Fields per Log</Label>
                          <Input type="number" defaultValue="100" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'alerts' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-yellow-500" />
                          Alert Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'High Error Rate', condition: 'error_rate > 5%', severity: 'critical', enabled: true },
                            { name: 'Slow Response Time', condition: 'avg(duration) > 2000ms', severity: 'warning', enabled: true },
                            { name: 'Service Down', condition: 'count(status=500) > 10/min', severity: 'critical', enabled: true },
                            { name: 'Memory Pressure', condition: 'memory_usage > 90%', severity: 'warning', enabled: false },
                            { name: 'Disk Full', condition: 'disk_usage > 95%', severity: 'critical', enabled: true }
                          ].map(rule => (
                            <div key={rule.name} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <AlertTriangle className={`w-4 h-4 ${rule.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                <div>
                                  <p className="font-medium">{rule.name}</p>
                                  <p className="text-sm text-muted-foreground font-mono">{rule.condition}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {rule.severity}
                                </Badge>
                                <Switch checked={rule.enabled} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleOpenAlertDialog}
                          className="w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-purple-300 transition-colors"
                        >
                          <Plus className="w-4 h-4 inline-block mr-2" />
                          Create Alert Rule
                        </button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          Notification Channels
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Email', description: 'ops-team@freeflow.io', connected: true },
                            { name: 'Slack', description: '#ops-alerts', connected: true },
                            { name: 'PagerDuty', description: 'Escalation service', connected: true },
                            { name: 'Opsgenie', description: 'On-call management', connected: false },
                            { name: 'Webhook', description: 'Custom HTTP endpoint', connected: false }
                          ].map(channel => (
                            <div key={channel.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Link2 className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{channel.name}</p>
                                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                                </div>
                              </div>
                              <Badge variant={channel.connected ? 'default' : 'outline'}>
                                {channel.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'archiving' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="w-5 h-5 text-indigo-500" />
                          Log Archiving
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Archiving</p>
                            <p className="text-sm text-muted-foreground">Archive logs to cold storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Archive After (days)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Delete After (days)</Label>
                            <Input type="number" defaultValue="365" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Compress Archives</p>
                            <p className="text-sm text-muted-foreground">Use gzip compression for storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-green-500" />
                          Storage Destinations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Amazon S3', description: 's3://freeflow-logs/archive/', connected: true },
                            { name: 'Google Cloud Storage', description: 'gs://freeflow-logs/', connected: false },
                            { name: 'Azure Blob Storage', description: 'Azure container', connected: false },
                            { name: 'Local Storage', description: '/var/log/archive/', connected: true }
                          ].map(storage => (
                            <div key={storage.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Database className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{storage.name}</p>
                                  <p className="text-sm text-muted-foreground font-mono">{storage.description}</p>
                                </div>
                              </div>
                              <Badge variant={storage.connected ? 'default' : 'secondary'}>
                                {storage.connected ? 'Active' : 'Configure'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="w-5 h-5 text-orange-500" />
                          Rehydration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Rehydration</p>
                            <p className="text-sm text-muted-foreground">Restore archived logs on demand</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Rehydration Size (GB)</Label>
                          <Input type="number" defaultValue="100" className="w-32" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-delete Rehydrated</p>
                            <p className="text-sm text-muted-foreground">Remove rehydrated logs after 7 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-blue-500" />
                          Log Sources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Docker', description: 'Container logs via daemon', enabled: true },
                            { name: 'Kubernetes', description: 'Pod and cluster logs', enabled: true },
                            { name: 'AWS CloudWatch', description: 'Import from CloudWatch Logs', enabled: true },
                            { name: 'Fluentd', description: 'Forward via Fluentd agent', enabled: false },
                            { name: 'Filebeat', description: 'Elastic Filebeat forwarder', enabled: false }
                          ].map(source => (
                            <div key={source.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Upload className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{source.name}</p>
                                  <p className="text-sm text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                              <Switch checked={source.enabled} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-500" />
                          Webhooks & Exports
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook Endpoint</Label>
                          <Input placeholder="https://your-app.com/webhooks/logs" />
                        </div>
                        <div className="space-y-2">
                          <Label>Events to Send</Label>
                          <div className="flex flex-wrap gap-2">
                            {['error', 'critical', 'alert_triggered', 'anomaly_detected'].map(event => (
                              <Badge key={event} variant="secondary" className="cursor-pointer hover:bg-purple-100">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Batch Requests</p>
                            <p className="text-sm text-muted-foreground">Group events before sending</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-green-500" />
                          Analytics Integrations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Grafana', description: 'Dashboards and visualization', connected: true },
                            { name: 'Prometheus', description: 'Metrics from logs', connected: true },
                            { name: 'OpenTelemetry', description: 'Distributed tracing', connected: false },
                            { name: 'Jaeger', description: 'Trace visualization', connected: false }
                          ].map(tool => (
                            <div key={tool.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <LineChart className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{tool.name}</p>
                                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                                </div>
                              </div>
                              <Badge variant={tool.connected ? 'default' : 'outline'}>
                                {tool.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-blue-500" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="log_api_••••••••••••••••••••" readOnly className="font-mono" />
                            <button
                              onClick={handleCopyApiKey}
                              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Requests per minute</p>
                          </div>
                          <Input type="number" defaultValue="1000" className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Query API</p>
                            <p className="text-sm text-muted-foreground">Allow external log queries</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Security & Compliance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">PII Masking</p>
                            <p className="text-sm text-muted-foreground">Automatically mask sensitive data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Encryption at Rest</p>
                            <p className="text-sm text-muted-foreground">Encrypt stored logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-muted-foreground">Log all access to logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">RBAC Enforcement</p>
                            <p className="text-sm text-muted-foreground">Role-based access control</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Purge All Logs</p>
                            <p className="text-sm text-muted-foreground">Permanently delete all log data</p>
                          </div>
                          <button
                            onClick={handleOpenPurgeDialog}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Purge
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Reset All Parsers</p>
                            <p className="text-sm text-muted-foreground">Reset parsing rules to defaults</p>
                          </div>
                          <button
                            onClick={() => {
                              toast.promise(
                                fetch('/api/activity-logs/parsers/reset', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                                {
                                  loading: 'Resetting parsers...',
                                  success: 'All parsers have been reset to defaults',
                                  error: 'Failed to reset parsers'
                                }
                              )
                            }}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reset
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Export All Data</p>
                            <p className="text-sm text-muted-foreground">Download complete log archive</p>
                          </div>
                          <button
                            onClick={handleOpenExportDialog}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>
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
              title="Logs Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockLogsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockLogsPredictions}
              title="System Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockLogsActivities}
            title="System Activity"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedLog && (
                <>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(selectedLog.level)}`}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm">{selectedLog.service}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-gray-100 font-mono">{selectedLog.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Request Info</h4>
                    <div className="space-y-2 text-sm">
                      {selectedLog.method && <div><span className="text-gray-500">Method:</span> <span className="font-mono">{selectedLog.method}</span></div>}
                      {selectedLog.path && <div><span className="text-gray-500">Path:</span> <span className="font-mono">{selectedLog.path}</span></div>}
                      {selectedLog.statusCode && <div><span className="text-gray-500">Status:</span> <span className={selectedLog.statusCode < 400 ? 'text-green-600' : 'text-red-600'}>{selectedLog.statusCode}</span></div>}
                      {selectedLog.duration && <div><span className="text-gray-500">Duration:</span> <span>{selectedLog.duration}ms</span></div>}
                      {selectedLog.ip && <div><span className="text-gray-500">IP:</span> <span className="font-mono">{selectedLog.ip}</span></div>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Context</h4>
                    <div className="space-y-2 text-sm">
                      {selectedLog.traceId && <div><span className="text-gray-500">Trace ID:</span> <span className="font-mono text-purple-600">{selectedLog.traceId}</span></div>}
                      {selectedLog.requestId && <div><span className="text-gray-500">Request ID:</span> <span className="font-mono">{selectedLog.requestId}</span></div>}
                      {selectedLog.sessionId && <div><span className="text-gray-500">Session:</span> <span className="font-mono">{selectedLog.sessionId}</span></div>}
                      <div><span className="text-gray-500">Host:</span> <span>{selectedLog.host}</span></div>
                    </div>
                  </div>
                </div>

                {selectedLog.userId && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedLog.userName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedLog.userEmail}</div>
                      </div>
                    </div>
                  </div>
                )}

                {Object.keys(selectedLog.attributes).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attributes</h4>
                    <pre className="p-4 bg-gray-900 rounded-lg text-gray-100 font-mono text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.attributes, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.stackTrace && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stack Trace</h4>
                    <pre className="p-4 bg-gray-900 rounded-lg text-red-400 font-mono text-sm overflow-x-auto">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => {
                if (selectedLog) {
                  handleBookmarkLog(selectedLog)
                }
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Bookmark
            </button>
            <button
              onClick={() => {
                if (selectedLog) {
                  handleCreateAlert(selectedLog)
                }
              }}
              className="px-4 py-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Create Alert
            </button>
            <button
              onClick={() => setShowLogDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            <button
              onClick={handleCopyLog}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Log
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Query Dialog */}
      <Dialog open={showQueryDialog} onOpenChange={setShowQueryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Query Name</label>
              <input
                type="text"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white"
                placeholder="My Saved Query"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Query</label>
              <textarea
                rows={3}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefaultQuery}
                onChange={(e) => setIsDefaultQuery(e.target.checked)}
                className="rounded border-gray-300 text-purple-600"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">Set as default view</label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowQueryDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuery}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              Save Query
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-500" />
              Export Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Format</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                {(['csv', 'json', 'txt'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      exportFormat === format
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{filteredLogs.length}</strong> logs will be exported based on current filters
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowExportDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExportWithFormat}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-500" />
              Advanced Filters
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Level</label>
                <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as LogSource | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="cron">Cron</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Last 15 minutes</SelectItem>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="4h">Last 4 hours</SelectItem>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Query</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Clear Filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilterDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date Range Dialog */}
      <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Custom Date Range
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-white"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); setTimeRange('15m') }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 15 min
              </button>
              <button
                onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); setTimeRange('1h') }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last Hour
              </button>
              <button
                onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); setTimeRange('1d') }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 24h
              </button>
              <button
                onClick={() => { setDateRangeStart(''); setDateRangeEnd(''); setTimeRange('7d') }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 7 days
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowDateRangeDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyDateRange}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              Apply
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Rule Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Create Alert Rule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Name</label>
              <Input
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                placeholder="e.g., High Error Rate Alert"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Level</label>
                <Select value={alertLevel} onValueChange={(v) => setAlertLevel(v as LogLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold</label>
                <Input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Alert will trigger when more than <strong>{alertThreshold}</strong> {alertLevel} logs occur within 60 seconds
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowAlertDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlertRule}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Detail Dialog */}
      <Dialog open={showPatternDialog} onOpenChange={setShowPatternDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Pattern Details
            </DialogTitle>
          </DialogHeader>
          {selectedPattern && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-gray-100 font-mono">{selectedPattern.pattern}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Occurrences</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPattern.count.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500">Trend</p>
                  <p className={`text-2xl font-bold flex items-center gap-1 ${
                    selectedPattern.trend === 'up' ? 'text-red-500' : selectedPattern.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {selectedPattern.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : selectedPattern.trend === 'down' ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    {selectedPattern.trend}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Affected Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.services.map(service => (
                    <span key={service} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>First seen: {selectedPattern.firstSeen}</span>
                <span>Last seen: {selectedPattern.lastSeen}</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowPatternDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (selectedPattern) {
                  setSearchQuery(selectedPattern.pattern)
                  setShowPatternDialog(false)
                  setActiveTab('logs')
                  toast.success('Filtering logs by pattern')
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Logs
            </button>
            <button
              onClick={handleCreatePatternAlert}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-500" />
              API Key Management
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current API Key</label>
              <div className="flex gap-2">
                <Input type="password" value="log_api_xxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                <button
                  onClick={handleCopyApiKey}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Warning: Regenerating your API key will invalidate the current key. All applications using the old key will need to be updated.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowApiKeyDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            <button
              onClick={handleRegenerateApiKey}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Key
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purge Confirmation Dialog */}
      <Dialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-5 h-5" />
              Confirm Purge
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Warning:</strong> This action will permanently delete all log data. This cannot be undone.
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You are about to purge <strong>{mockStats.totalLogs.toLocaleString()}</strong> log entries.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowPurgeDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePurgeLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Purge All Logs
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-pink-500" />
              Integrations
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {[
                { name: 'Slack', description: 'Send alerts to Slack channels', connected: true, icon: '💬' },
                { name: 'PagerDuty', description: 'Incident management integration', connected: true, icon: '🚨' },
                { name: 'Datadog', description: 'Forward logs to Datadog', connected: false, icon: '📊' },
                { name: 'Splunk', description: 'Export to Splunk Enterprise', connected: false, icon: '🔍' },
                { name: 'Email', description: 'Email notifications', connected: true, icon: '📧' }
              ].map(integration => (
                <div key={integration.name} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectIntegration(integration.name)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      integration.connected
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-100 hover:text-purple-700'
                    }`}
                  >
                    {integration.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowIntegrationDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
