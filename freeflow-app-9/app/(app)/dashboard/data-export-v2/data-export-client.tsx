'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Download, CheckCircle2, XCircle, Clock, Database, HardDrive, FileSpreadsheet,
  FileCode, FileText, Shield, Archive, Play, Pause, RefreshCw, Settings,
  Calendar, Zap, GitBranch, ArrowRight, Filter, Layers, AlertTriangle,
  BarChart3, History, Plus, Search, MoreHorizontal, Eye, Trash2, Copy,
  Server, Cloud, Table, Key, Lock, Globe, Check, X, ChevronRight, Activity
} from 'lucide-react'

// AWS DataPipeline/Fivetran level interfaces
interface DataSource {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'salesforce' | 'hubspot' | 's3' | 'bigquery' | 'snowflake' | 'api'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  host: string
  lastSync: string
  recordsExtracted: number
  tablesCount: number
  icon: string
}

interface Pipeline {
  id: string
  name: string
  description: string
  source: DataSource
  destination: {
    type: string
    name: string
  }
  schedule: {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'custom'
    cronExpression?: string
    nextRun: string
  }
  status: 'active' | 'paused' | 'error' | 'running'
  transforms: Transform[]
  lastRun: {
    timestamp: string
    duration: number
    recordsProcessed: number
    status: 'success' | 'failed' | 'partial'
  }
  metrics: {
    totalRuns: number
    successRate: number
    avgDuration: number
    dataVolume: string
  }
}

interface Transform {
  id: string
  name: string
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'dedupe' | 'custom'
  config: Record<string, unknown>
  order: number
}

interface ExportJob {
  id: string
  name: string
  pipelineId: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startTime: string
  endTime?: string
  recordsExported: number
  fileSizeMb: number
  format: 'csv' | 'json' | 'parquet' | 'avro'
  destination: string
  error?: string
}

interface SchemaMapping {
  sourceColumn: string
  destinationType: string
  destinationColumn: string
  transformation?: string
  isPrimaryKey: boolean
  isNullable: boolean
}

// Mock data sources
const mockDataSources: DataSource[] = [
  {
    id: 'ds1',
    name: 'Production PostgreSQL',
    type: 'postgresql',
    status: 'connected',
    host: 'prod-db.company.com:5432',
    lastSync: '2024-01-15T10:30:00Z',
    recordsExtracted: 2450000,
    tablesCount: 45,
    icon: '🐘'
  },
  {
    id: 'ds2',
    name: 'Salesforce CRM',
    type: 'salesforce',
    status: 'syncing',
    host: 'company.salesforce.com',
    lastSync: '2024-01-15T10:25:00Z',
    recordsExtracted: 850000,
    tablesCount: 28,
    icon: '☁️'
  },
  {
    id: 'ds3',
    name: 'MongoDB Analytics',
    type: 'mongodb',
    status: 'connected',
    host: 'analytics-cluster.mongodb.net',
    lastSync: '2024-01-15T09:45:00Z',
    recordsExtracted: 5200000,
    tablesCount: 12,
    icon: '🍃'
  },
  {
    id: 'ds4',
    name: 'HubSpot Marketing',
    type: 'hubspot',
    status: 'error',
    host: 'api.hubapi.com',
    lastSync: '2024-01-14T18:00:00Z',
    recordsExtracted: 320000,
    tablesCount: 15,
    icon: '🔶'
  },
  {
    id: 'ds5',
    name: 'AWS S3 Data Lake',
    type: 's3',
    status: 'connected',
    host: 's3://company-data-lake',
    lastSync: '2024-01-15T10:00:00Z',
    recordsExtracted: 12000000,
    tablesCount: 156,
    icon: '📦'
  }
]

// Mock pipelines
const mockPipelines: Pipeline[] = [
  {
    id: 'pipe1',
    name: 'Customer 360 Sync',
    description: 'Sync customer data from all sources to data warehouse',
    source: mockDataSources[0],
    destination: { type: 'snowflake', name: 'Analytics Warehouse' },
    schedule: { frequency: 'hourly', nextRun: '2024-01-15T11:00:00Z' },
    status: 'active',
    transforms: [
      { id: 't1', name: 'Filter Active', type: 'filter', config: {}, order: 1 },
      { id: 't2', name: 'Deduplicate', type: 'dedupe', config: {}, order: 2 }
    ],
    lastRun: {
      timestamp: '2024-01-15T10:00:00Z',
      duration: 245,
      recordsProcessed: 45000,
      status: 'success'
    },
    metrics: {
      totalRuns: 720,
      successRate: 99.2,
      avgDuration: 230,
      dataVolume: '2.4 TB'
    }
  },
  {
    id: 'pipe2',
    name: 'Sales Pipeline Export',
    description: 'Export sales data to BI tools',
    source: mockDataSources[1],
    destination: { type: 'bigquery', name: 'Sales Analytics' },
    schedule: { frequency: 'realtime', nextRun: 'Continuous' },
    status: 'running',
    transforms: [
      { id: 't3', name: 'Currency Convert', type: 'map', config: {}, order: 1 }
    ],
    lastRun: {
      timestamp: '2024-01-15T10:28:00Z',
      duration: 12,
      recordsProcessed: 1500,
      status: 'success'
    },
    metrics: {
      totalRuns: 8500,
      successRate: 98.5,
      avgDuration: 15,
      dataVolume: '850 GB'
    }
  },
  {
    id: 'pipe3',
    name: 'Marketing Attribution',
    description: 'Aggregate marketing data for attribution',
    source: mockDataSources[3],
    destination: { type: 's3', name: 'Marketing Lake' },
    schedule: { frequency: 'daily', nextRun: '2024-01-16T00:00:00Z' },
    status: 'error',
    transforms: [
      { id: 't4', name: 'Join Campaigns', type: 'join', config: {}, order: 1 },
      { id: 't5', name: 'Aggregate Metrics', type: 'aggregate', config: {}, order: 2 }
    ],
    lastRun: {
      timestamp: '2024-01-15T00:00:00Z',
      duration: 0,
      recordsProcessed: 0,
      status: 'failed'
    },
    metrics: {
      totalRuns: 30,
      successRate: 86.7,
      avgDuration: 1800,
      dataVolume: '120 GB'
    }
  }
]

// Mock export jobs
const mockExportJobs: ExportJob[] = [
  {
    id: 'job1',
    name: 'Q4 Financial Report',
    pipelineId: 'pipe1',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15T08:00:00Z',
    endTime: '2024-01-15T08:15:00Z',
    recordsExported: 1250000,
    fileSizeMb: 2400,
    format: 'parquet',
    destination: 's3://exports/finance/'
  },
  {
    id: 'job2',
    name: 'Customer Data Backup',
    pipelineId: 'pipe1',
    status: 'running',
    progress: 67,
    startTime: '2024-01-15T10:00:00Z',
    recordsExported: 850000,
    fileSizeMb: 1200,
    format: 'json',
    destination: 's3://backups/customers/'
  },
  {
    id: 'job3',
    name: 'Sales Export - Weekly',
    pipelineId: 'pipe2',
    status: 'queued',
    progress: 0,
    startTime: '2024-01-15T12:00:00Z',
    recordsExported: 0,
    fileSizeMb: 0,
    format: 'csv',
    destination: 'gs://analytics/sales/'
  }
]

// Mock schema mappings
const mockSchemaMappings: SchemaMapping[] = [
  { sourceColumn: 'id', destinationType: 'INTEGER', destinationColumn: 'customer_id', isPrimaryKey: true, isNullable: false },
  { sourceColumn: 'email', destinationType: 'VARCHAR(255)', destinationColumn: 'email_address', isPrimaryKey: false, isNullable: false },
  { sourceColumn: 'created_at', destinationType: 'TIMESTAMP', destinationColumn: 'created_timestamp', transformation: 'TO_UTC', isPrimaryKey: false, isNullable: false },
  { sourceColumn: 'revenue', destinationType: 'DECIMAL(10,2)', destinationColumn: 'total_revenue', transformation: 'CURRENCY_CONVERT', isPrimaryKey: false, isNullable: true },
  { sourceColumn: 'status', destinationType: 'VARCHAR(50)', destinationColumn: 'account_status', isPrimaryKey: false, isNullable: false }
]

export default function DataExportClient() {
  const [activeTab, setActiveTab] = useState('pipelines')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null)
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [showNewPipelineDialog, setShowNewPipelineDialog] = useState(false)
  const [showSchemaDialog, setShowSchemaDialog] = useState(false)

  const getSourceStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'syncing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'disconnected': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getPipelineStatusColor = (status: Pipeline['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'running': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  const getJobStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'running': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'queued': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const formatBytes = (mb: number) => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
    return `${mb.toFixed(0)} MB`
  }

  const stats = useMemo(() => ({
    totalSources: mockDataSources.length,
    connectedSources: mockDataSources.filter(s => s.status === 'connected' || s.status === 'syncing').length,
    activePipelines: mockPipelines.filter(p => p.status === 'active' || p.status === 'running').length,
    totalRecords: mockDataSources.reduce((sum, s) => sum + s.recordsExtracted, 0),
    runningJobs: mockExportJobs.filter(j => j.status === 'running').length,
    successRate: mockPipelines.reduce((sum, p) => sum + p.metrics.successRate, 0) / mockPipelines.length
  }), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Data Pipeline</h1>
                <p className="text-green-100">AWS DataPipeline / Fivetran-level ETL Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <History className="w-4 h-4 mr-2" />
                Job History
              </Button>
              <Button className="bg-white text-green-600 hover:bg-green-50">
                <Plus className="w-4 h-4 mr-2" />
                New Pipeline
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Data Sources</p>
                  <p className="text-2xl font-bold">{stats.connectedSources}/{stats.totalSources}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Active Pipelines</p>
                  <p className="text-2xl font-bold">{stats.activePipelines}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Records Synced</p>
                  <p className="text-2xl font-bold">{(stats.totalRecords / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Running Jobs</p>
                  <p className="text-2xl font-bold">{stats.runningJobs}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-green-200" />
                <div>
                  <p className="text-sm text-green-200">Data Volume</p>
                  <p className="text-2xl font-bold">3.4 TB</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pipelines" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Pipelines
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="transforms" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Transforms
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Schema Mapping
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Pipelines Tab */}
          <TabsContent value="pipelines" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search pipelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {mockPipelines.map(pipeline => (
                <Card key={pipeline.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <GitBranch className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{pipeline.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPipelineStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Pipeline Flow */}
                  <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border">
                      <span className="text-xl">{pipeline.source.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{pipeline.source.name}</p>
                        <p className="text-xs text-gray-500">{pipeline.source.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <ArrowRight className="w-4 h-4" />
                      {pipeline.transforms.map((t, i) => (
                        <div key={t.id} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {t.name}
                          </Badge>
                          {i < pipeline.transforms.length - 1 && <ArrowRight className="w-3 h-3" />}
                        </div>
                      ))}
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border">
                      <Cloud className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{pipeline.destination.name}</p>
                        <p className="text-xs text-gray-500">{pipeline.destination.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{pipeline.metrics.totalRuns}</p>
                      <p className="text-xs text-gray-500">Total Runs</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{pipeline.metrics.successRate}%</p>
                      <p className="text-xs text-gray-500">Success Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(pipeline.metrics.avgDuration)}</p>
                      <p className="text-xs text-gray-500">Avg Duration</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{pipeline.metrics.dataVolume}</p>
                      <p className="text-xs text-gray-500">Data Volume</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{pipeline.schedule.frequency}</p>
                      <p className="text-xs text-gray-500">Frequency</p>
                    </div>
                  </div>

                  {/* Last Run & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Last run: {new Date(pipeline.lastRun.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <Badge className={pipeline.lastRun.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {pipeline.lastRun.recordsProcessed.toLocaleString()} records
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Logs
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      {pipeline.status === 'active' ? (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Run Now
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Connected Data Sources</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {mockDataSources.map(source => (
                <Card key={source.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{source.icon}</div>
                      <div>
                        <h3 className="font-semibold">{source.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{source.type}</p>
                      </div>
                    </div>
                    <Badge className={getSourceStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 truncate">{source.host}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Table className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{source.tablesCount} tables</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {(source.recordsExtracted / 1000000).toFixed(1)}M records
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last sync</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(source.lastSync).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Add Source Card */}
              <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Add New Source</p>
                <p className="text-sm text-gray-500">Connect database, API, or file</p>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Export Jobs</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Export
                </Button>
              </div>
            </div>

            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500">
                  <div>Job Name</div>
                  <div>Status</div>
                  <div>Progress</div>
                  <div>Records</div>
                  <div>Size</div>
                  <div>Destination</div>
                  <div>Actions</div>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                {mockExportJobs.map(job => (
                  <div key={job.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="grid grid-cols-7 gap-4 items-center">
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-xs text-gray-500">{job.format.toUpperCase()}</p>
                      </div>
                      <div>
                        <Badge className={getJobStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div>
                        <Progress value={job.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{job.progress}%</p>
                      </div>
                      <div className="text-sm">{job.recordsExported.toLocaleString()}</div>
                      <div className="text-sm">{formatBytes(job.fileSizeMb)}</div>
                      <div className="text-sm text-gray-500 truncate">{job.destination}</div>
                      <div className="flex items-center gap-1">
                        {job.status === 'completed' && (
                          <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {job.status === 'running' && (
                          <Button variant="ghost" size="icon">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Transforms Tab */}
          <TabsContent value="transforms" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Data Transformations</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Transform
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { type: 'filter', name: 'Filter', icon: Filter, desc: 'Filter rows based on conditions' },
                { type: 'map', name: 'Map/Transform', icon: ArrowRight, desc: 'Transform column values' },
                { type: 'aggregate', name: 'Aggregate', icon: Layers, desc: 'Group and aggregate data' },
                { type: 'join', name: 'Join', icon: GitBranch, desc: 'Combine multiple data sources' },
                { type: 'dedupe', name: 'Deduplicate', icon: Copy, desc: 'Remove duplicate records' },
                { type: 'custom', name: 'Custom SQL', icon: FileCode, desc: 'Write custom SQL transforms' }
              ].map(transform => (
                <Card key={transform.type} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <transform.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold">{transform.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transform.desc}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schema Mapping Tab */}
          <TabsContent value="schema" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Schema Mapping</h2>
                <p className="text-sm text-gray-500">Configure how source columns map to destination</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-detect Schema
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Mapping
                </Button>
              </div>
            </div>

            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
                  <div>Source Column</div>
                  <div>Destination Column</div>
                  <div>Data Type</div>
                  <div>Transformation</div>
                  <div>Constraints</div>
                  <div>Actions</div>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                {mockSchemaMappings.map((mapping, i) => (
                  <div key={i} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {mapping.sourceColumn}
                        </code>
                      </div>
                      <div>
                        <code className="text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-400">
                          {mapping.destinationColumn}
                        </code>
                      </div>
                      <div className="text-sm">{mapping.destinationType}</div>
                      <div>
                        {mapping.transformation ? (
                          <Badge variant="outline">{mapping.transformation}</Badge>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {mapping.isPrimaryKey && (
                          <Badge className="bg-purple-100 text-purple-700">PK</Badge>
                        )}
                        {!mapping.isNullable && (
                          <Badge className="bg-orange-100 text-orange-700">NOT NULL</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Successful Jobs (24h)</p>
                    <p className="text-2xl font-bold">847</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Failed Jobs (24h)</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Processed (24h)</p>
                    <p className="text-2xl font-bold">1.2 TB</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Latency</p>
                    <p className="text-2xl font-bold">45ms</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Pipeline Health</h3>
                <div className="space-y-4">
                  {mockPipelines.map(pipeline => (
                    <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          pipeline.status === 'active' || pipeline.status === 'running' ? 'bg-green-500' :
                          pipeline.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="font-medium">{pipeline.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{pipeline.metrics.successRate}% success</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">Pipeline Failed</p>
                      <p className="text-sm text-red-600 dark:text-red-300">Marketing Attribution - Connection timeout</p>
                      <p className="text-xs text-red-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">High Latency</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">Customer 360 Sync - Avg duration increased</p>
                      <p className="text-xs text-yellow-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-400">Schema Change Detected</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Production PostgreSQL - New column added</p>
                      <p className="text-xs text-blue-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
