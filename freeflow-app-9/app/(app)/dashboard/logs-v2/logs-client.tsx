'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  FileText, AlertCircle, CheckCircle, Info, AlertTriangle, XCircle, Search,
  Download, Filter, Clock, Server, Code, Database, Zap, Play, Pause, RefreshCw,
  ChevronRight, ChevronDown, Eye, Settings, BarChart3, Activity, Layers,
  Terminal, Hash, Tag, Bookmark, Share2, Copy, ExternalLink, Globe, Cpu,
  HardDrive, Wifi, TrendingUp, TrendingDown, ArrowUp, ArrowDown, MoreHorizontal,
  Plus, Trash2, Calendar, LineChart
} from 'lucide-react'

// DataDog-level interfaces
interface LogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace'
  service: string
  host: string
  message: string
  attributes: Record<string, unknown>
  traceId?: string
  spanId?: string
  tags: string[]
  status?: number
  duration?: number
}

interface LogStream {
  id: string
  name: string
  query: string
  color: string
  count: number
  isLive: boolean
}

interface LogPattern {
  id: string
  pattern: string
  count: number
  percentage: number
  firstSeen: string
  lastSeen: string
  services: string[]
  level: 'error' | 'warn' | 'info' | 'debug'
}

interface LogMetric {
  name: string
  value: number
  unit: string
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface SavedView {
  id: string
  name: string
  query: string
  filters: Record<string, string[]>
  columns: string[]
  createdAt: string
  isDefault: boolean
}

interface LogAlert {
  id: string
  name: string
  query: string
  threshold: number
  operator: 'above' | 'below' | 'equal'
  status: 'ok' | 'warning' | 'critical' | 'no_data'
  lastTriggered?: string
}

// Mock log entries
const mockLogs: LogEntry[] = [
  {
    id: 'log1',
    timestamp: '2024-01-15T10:30:45.123Z',
    level: 'error',
    service: 'api-gateway',
    host: 'prod-api-01',
    message: 'Failed to process request: Connection timeout to database cluster',
    attributes: { requestId: 'req-123', userId: 'usr-456', endpoint: '/api/v1/users' },
    traceId: 'trace-789',
    spanId: 'span-001',
    tags: ['production', 'api', 'database'],
    status: 504,
    duration: 30250
  },
  {
    id: 'log2',
    timestamp: '2024-01-15T10:30:44.892Z',
    level: 'warn',
    service: 'auth-service',
    host: 'prod-auth-02',
    message: 'Rate limit approaching for IP 192.168.1.100',
    attributes: { ip: '192.168.1.100', currentRate: 95, limit: 100 },
    tags: ['production', 'auth', 'rate-limit'],
    status: 429
  },
  {
    id: 'log3',
    timestamp: '2024-01-15T10:30:44.567Z',
    level: 'info',
    service: 'payment-processor',
    host: 'prod-payment-01',
    message: 'Payment processed successfully',
    attributes: { transactionId: 'txn-789', amount: 99.99, currency: 'USD' },
    traceId: 'trace-456',
    tags: ['production', 'payment', 'success'],
    status: 200,
    duration: 1250
  },
  {
    id: 'log4',
    timestamp: '2024-01-15T10:30:44.234Z',
    level: 'debug',
    service: 'cache-service',
    host: 'prod-cache-01',
    message: 'Cache miss for key: user:profile:123',
    attributes: { key: 'user:profile:123', ttl: 3600 },
    tags: ['production', 'cache'],
    duration: 5
  },
  {
    id: 'log5',
    timestamp: '2024-01-15T10:30:43.999Z',
    level: 'error',
    service: 'notification-service',
    host: 'prod-notify-01',
    message: 'Failed to send email: SMTP connection refused',
    attributes: { recipient: 'user@example.com', type: 'welcome_email' },
    tags: ['production', 'notification', 'email'],
    status: 500
  },
  {
    id: 'log6',
    timestamp: '2024-01-15T10:30:43.567Z',
    level: 'info',
    service: 'api-gateway',
    host: 'prod-api-02',
    message: 'Request completed: GET /api/v1/products',
    attributes: { method: 'GET', path: '/api/v1/products', responseSize: 15420 },
    traceId: 'trace-111',
    tags: ['production', 'api'],
    status: 200,
    duration: 89
  }
]

// Mock log streams
const mockStreams: LogStream[] = [
  { id: 's1', name: 'All Errors', query: 'level:error', color: 'red', count: 145, isLive: true },
  { id: 's2', name: 'API Gateway', query: 'service:api-gateway', color: 'blue', count: 2340, isLive: true },
  { id: 's3', name: 'High Latency', query: 'duration:>1000', color: 'yellow', count: 67, isLive: false },
  { id: 's4', name: 'Payment Errors', query: 'service:payment-processor level:error', color: 'purple', count: 12, isLive: true },
  { id: 's5', name: 'Auth Failures', query: 'service:auth-service status:401', color: 'orange', count: 89, isLive: false }
]

// Mock patterns
const mockPatterns: LogPattern[] = [
  { id: 'p1', pattern: 'Connection timeout to * cluster', count: 234, percentage: 15.2, firstSeen: '2024-01-14T08:00:00Z', lastSeen: '2024-01-15T10:30:00Z', services: ['api-gateway', 'payment-processor'], level: 'error' },
  { id: 'p2', pattern: 'Rate limit approaching for IP *', count: 567, percentage: 8.4, firstSeen: '2024-01-15T00:00:00Z', lastSeen: '2024-01-15T10:30:00Z', services: ['auth-service'], level: 'warn' },
  { id: 'p3', pattern: 'Cache miss for key: *', count: 12450, percentage: 45.3, firstSeen: '2024-01-10T00:00:00Z', lastSeen: '2024-01-15T10:30:00Z', services: ['cache-service'], level: 'debug' },
  { id: 'p4', pattern: 'Request completed: * /api/*', count: 89000, percentage: 78.9, firstSeen: '2024-01-01T00:00:00Z', lastSeen: '2024-01-15T10:30:00Z', services: ['api-gateway'], level: 'info' }
]

// Mock saved views
const mockSavedViews: SavedView[] = [
  { id: 'v1', name: 'Production Errors', query: 'env:production level:error', filters: { service: ['api-gateway', 'auth-service'] }, columns: ['timestamp', 'level', 'service', 'message'], createdAt: '2024-01-10T10:00:00Z', isDefault: true },
  { id: 'v2', name: 'Payment Transactions', query: 'service:payment-processor', filters: { level: ['info', 'error'] }, columns: ['timestamp', 'message', 'attributes.transactionId'], createdAt: '2024-01-12T14:00:00Z', isDefault: false },
  { id: 'v3', name: 'High Latency Requests', query: 'duration:>500', filters: {}, columns: ['timestamp', 'service', 'duration', 'message'], createdAt: '2024-01-14T09:00:00Z', isDefault: false }
]

// Mock alerts
const mockAlerts: LogAlert[] = [
  { id: 'a1', name: 'Error Rate Spike', query: 'level:error', threshold: 50, operator: 'above', status: 'ok', lastTriggered: '2024-01-14T15:30:00Z' },
  { id: 'a2', name: 'Payment Failures', query: 'service:payment-processor level:error', threshold: 5, operator: 'above', status: 'critical', lastTriggered: '2024-01-15T10:25:00Z' },
  { id: 'a3', name: 'API Latency', query: 'service:api-gateway duration:>2000', threshold: 10, operator: 'above', status: 'warning' },
  { id: 'a4', name: 'No Auth Logs', query: 'service:auth-service', threshold: 0, operator: 'equal', status: 'no_data' }
]

export default function LogsClient() {
  const [activeTab, setActiveTab] = useState('explorer')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('15m')
  const [isLive, setIsLive] = useState(true)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<string[]>([])

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'warn': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'debug': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'trace': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4" />
      case 'warn': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Info className="w-4 h-4" />
      case 'debug': return <Code className="w-4 h-4" />
      case 'trace': return <Terminal className="w-4 h-4" />
    }
  }

  const getAlertStatusColor = (status: LogAlert['status']) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'critical': return 'bg-red-100 text-red-700'
      case 'no_data': return 'bg-gray-100 text-gray-700'
    }
  }

  const toggleLogExpand = (logId: string) => {
    setExpandedLogs(prev =>
      prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]
    )
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
    return `${(ms / 60000).toFixed(2)}m`
  }

  const stats = useMemo(() => ({
    totalLogs: mockLogs.length * 1000,
    errorRate: ((mockLogs.filter(l => l.level === 'error').length / mockLogs.length) * 100),
    avgLatency: mockLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / mockLogs.filter(l => l.duration).length,
    activeServices: [...new Set(mockLogs.map(l => l.service))].length
  }), [])

  const logsByLevel = useMemo(() => ({
    error: mockLogs.filter(l => l.level === 'error').length,
    warn: mockLogs.filter(l => l.level === 'warn').length,
    info: mockLogs.filter(l => l.level === 'info').length,
    debug: mockLogs.filter(l => l.level === 'debug').length
  }), [])

  const filteredLogs = selectedLevel
    ? mockLogs.filter(l => l.level === selectedLevel)
    : mockLogs

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-slate-800 to-zinc-800 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Terminal className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Log Explorer</h1>
                <p className="text-gray-300">DataDog-level Observability Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <Clock className="w-4 h-4" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                >
                  <option value="5m">Last 5 minutes</option>
                  <option value="15m">Last 15 minutes</option>
                  <option value="1h">Last 1 hour</option>
                  <option value="4h">Last 4 hours</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
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
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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
                placeholder="Search logs... (e.g., service:api-gateway level:error status:>400)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
              />
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12">
              <Filter className="w-4 h-4 mr-2" />
              Facets
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-sm text-gray-300">Total Logs</p>
                  <p className="text-2xl font-bold">{(stats.totalLogs / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm text-gray-300">Error Rate</p>
                  <p className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">Avg Latency</p>
                  <p className="text-2xl font-bold">{formatDuration(stats.avgLatency)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">Services</p>
                  <p className="text-2xl font-bold">{stats.activeServices}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-300">Logs/sec</p>
                  <p className="text-2xl font-bold">1.2K</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-5 gap-6">
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
                    <div className="flex items-center gap-2">
                      <Badge className={getLevelColor(level as LogEntry['level'])}>{level}</Badge>
                    </div>
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
              <div className="space-y-2">
                {[...new Set(mockLogs.map(l => l.service))].map(service => (
                  <div key={service} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                    <span className="text-sm">{service}</span>
                    <span className="text-xs text-gray-500">{mockLogs.filter(l => l.service === service).length}</span>
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
                {mockSavedViews.map(view => (
                  <div key={view.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{view.name}</span>
                      {view.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Save View
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="explorer" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Log Explorer
                </TabsTrigger>
                <TabsTrigger value="streams" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Live Streams
                </TabsTrigger>
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Alerts
                </TabsTrigger>
              </TabsList>

              {/* Log Explorer Tab */}
              <TabsContent value="explorer" className="space-y-4">
                {/* Log Distribution Chart */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Log Volume Over Time</h3>
                    <div className="flex items-center gap-4">
                      {Object.entries(logsByLevel).map(([level, count]) => (
                        <div key={level} className="flex items-center gap-2 text-sm">
                          <div className={`w-3 h-3 rounded ${
                            level === 'error' ? 'bg-red-500' :
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
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                </Card>

                {/* Log Entries */}
                <Card>
                  <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{filteredLogs.length} logs found</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                              {expandedLogs.includes(log.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="text-gray-400 text-xs w-44 flex-shrink-0">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <Badge className={`${getLevelColor(log.level)} flex-shrink-0`}>
                              {getLevelIcon(log.level)}
                              <span className="ml-1 uppercase">{log.level}</span>
                            </Badge>
                            <span className="text-purple-600 dark:text-purple-400 flex-shrink-0">
                              {log.service}
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">
                              {log.message}
                            </span>
                            {log.duration && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatDuration(log.duration)}
                              </span>
                            )}
                          </div>

                          {expandedLogs.includes(log.id) && (
                            <div className="px-10 pb-4 space-y-3">
                              <div className="grid grid-cols-4 gap-4 text-xs">
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
                                  <p className="font-medium text-blue-600">{log.traceId || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Duration</span>
                                  <p className="font-medium">{formatDuration(log.duration)}</p>
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
                                  <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(log.attributes, null, 2)}
                                  </pre>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Button variant="ghost" size="sm">
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copy
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="w-4 h-4 mr-1" />
                                  Share
                                </Button>
                                {log.traceId && (
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Trace
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>

              {/* Streams Tab */}
              <TabsContent value="streams" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Live Log Streams</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Stream
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mockStreams.map(stream => (
                    <Card key={stream.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${stream.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                          <div>
                            <h3 className="font-semibold">{stream.name}</h3>
                            <code className="text-xs text-gray-500">{stream.query}</code>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{stream.count.toLocaleString()}</span>
                        <Badge variant={stream.isLive ? 'default' : 'outline'}>
                          {stream.isLive ? 'Live' : 'Paused'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Patterns Tab */}
              <TabsContent value="patterns" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Log Patterns</h2>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Analyze
                  </Button>
                </div>

                <Card>
                  <ScrollArea className="h-[500px]">
                    {mockPatterns.map(pattern => (
                      <div key={pattern.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {pattern.pattern}
                            </code>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>First seen: {new Date(pattern.firstSeen).toLocaleDateString()}</span>
                              <span>Last seen: {new Date(pattern.lastSeen).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{pattern.count.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{pattern.percentage}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getLevelColor(pattern.level)}>{pattern.level}</Badge>
                          {pattern.services.map(s => (
                            <Badge key={s} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-6">
                    <h3 className="text-sm text-gray-500 mb-2">Error Trend</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">-23%</span>
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">vs last period</p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-sm text-gray-500 mb-2">Log Volume</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">+45%</span>
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">vs last period</p>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-sm text-gray-500 mb-2">P99 Latency</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">245ms</span>
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">-12% vs last period</p>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Log Level Distribution Over Time</h3>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <LineChart className="w-16 h-16" />
                    <span className="ml-4">Time series chart placeholder</span>
                  </div>
                </Card>
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Log Alerts</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>

                <div className="grid gap-4">
                  {mockAlerts.map(alert => (
                    <Card key={alert.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            alert.status === 'ok' ? 'bg-green-500' :
                            alert.status === 'warning' ? 'bg-yellow-500' :
                            alert.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-semibold">{alert.name}</h3>
                            <code className="text-xs text-gray-500">{alert.query}</code>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">Threshold: {alert.threshold} ({alert.operator})</p>
                            {alert.lastTriggered && (
                              <p className="text-xs text-gray-500">
                                Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Badge className={getAlertStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
