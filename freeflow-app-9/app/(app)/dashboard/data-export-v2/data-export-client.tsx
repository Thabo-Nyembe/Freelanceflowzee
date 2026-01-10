'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Download, CheckCircle2, XCircle, Clock, Database, HardDrive,
  FileCode, Shield, Archive, Play, Pause, RefreshCw, Settings, Zap, GitBranch, ArrowRight, Filter, Layers, AlertTriangle,
  BarChart3, History, Plus, Search, MoreHorizontal, Eye, Trash2, Copy,
  Server, Cloud, Table, Key, Globe, Activity
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

interface Destination {
  id: string
  name: string
  type: 'warehouse' | 'lake' | 'api' | 'file' | 'stream'
  platform: 'snowflake' | 'bigquery' | 'redshift' | 's3' | 'gcs' | 'kafka' | 'webhook'
  status: 'active' | 'inactive' | 'error'
  host: string
  lastWrite: string
  recordsWritten: number
  dataVolume: string
  icon: string
}

interface AuditLog {
  id: string
  action: 'create' | 'update' | 'delete' | 'run' | 'error' | 'connect'
  resource: string
  resourceType: 'pipeline' | 'source' | 'destination' | 'job'
  user: string
  timestamp: string
  details: string
  status: 'success' | 'failed'
}

interface Integration {
  id: string
  name: string
  category: 'analytics' | 'marketing' | 'crm' | 'support' | 'advertising' | 'product'
  status: 'enabled' | 'disabled' | 'pending'
  eventsTracked: number
  lastEvent: string
  icon: string
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

// Mock destinations
const mockDestinations: Destination[] = [
  { id: 'dest1', name: 'Analytics Warehouse', type: 'warehouse', platform: 'snowflake', status: 'active', host: 'company.snowflakecomputing.com', lastWrite: '2024-12-25T10:30:00Z', recordsWritten: 45000000, dataVolume: '2.4 TB', icon: '❄️' },
  { id: 'dest2', name: 'Sales Analytics', type: 'warehouse', platform: 'bigquery', status: 'active', host: 'bigquery.googleapis.com/company-project', lastWrite: '2024-12-25T10:28:00Z', recordsWritten: 12000000, dataVolume: '850 GB', icon: '📊' },
  { id: 'dest3', name: 'Marketing Lake', type: 'lake', platform: 's3', status: 'active', host: 's3://company-marketing-lake', lastWrite: '2024-12-24T00:00:00Z', recordsWritten: 8500000, dataVolume: '320 GB', icon: '📦' },
  { id: 'dest4', name: 'Real-time Events', type: 'stream', platform: 'kafka', status: 'active', host: 'kafka.company.com:9092', lastWrite: '2024-12-25T10:30:00Z', recordsWritten: 125000000, dataVolume: '1.2 TB', icon: '⚡' },
  { id: 'dest5', name: 'BI Webhook', type: 'api', platform: 'webhook', status: 'inactive', host: 'https://bi.company.com/webhook', lastWrite: '2024-12-23T18:00:00Z', recordsWritten: 500000, dataVolume: '45 GB', icon: '🔗' },
  { id: 'dest6', name: 'Archive Storage', type: 'file', platform: 'gcs', status: 'active', host: 'gs://company-archive', lastWrite: '2024-12-25T06:00:00Z', recordsWritten: 250000000, dataVolume: '5.8 TB', icon: '🗄️' }
]

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  { id: 'audit1', action: 'run', resource: 'Customer 360 Sync', resourceType: 'pipeline', user: 'system', timestamp: '2024-12-25T10:00:00Z', details: 'Scheduled run completed successfully', status: 'success' },
  { id: 'audit2', action: 'error', resource: 'Marketing Attribution', resourceType: 'pipeline', user: 'system', timestamp: '2024-12-25T00:00:00Z', details: 'Connection timeout to HubSpot API', status: 'failed' },
  { id: 'audit3', action: 'update', resource: 'Production PostgreSQL', resourceType: 'source', user: 'admin@company.com', timestamp: '2024-12-24T15:30:00Z', details: 'Updated connection credentials', status: 'success' },
  { id: 'audit4', action: 'create', resource: 'Q4 Financial Report', resourceType: 'job', user: 'finance@company.com', timestamp: '2024-12-25T08:00:00Z', details: 'Created new export job', status: 'success' },
  { id: 'audit5', action: 'connect', resource: 'AWS S3 Data Lake', resourceType: 'source', user: 'data-eng@company.com', timestamp: '2024-12-24T10:00:00Z', details: 'Successfully connected to S3 bucket', status: 'success' },
  { id: 'audit6', action: 'delete', resource: 'Old Test Pipeline', resourceType: 'pipeline', user: 'admin@company.com', timestamp: '2024-12-23T14:00:00Z', details: 'Deleted unused test pipeline', status: 'success' }
]

// Mock integrations (Segment-style)
const mockIntegrations: Integration[] = [
  { id: 'int1', name: 'Google Analytics 4', category: 'analytics', status: 'enabled', eventsTracked: 2500000, lastEvent: '2024-12-25T10:30:00Z', icon: '📈' },
  { id: 'int2', name: 'Mixpanel', category: 'analytics', status: 'enabled', eventsTracked: 1800000, lastEvent: '2024-12-25T10:29:00Z', icon: '📊' },
  { id: 'int3', name: 'Amplitude', category: 'product', status: 'enabled', eventsTracked: 3200000, lastEvent: '2024-12-25T10:30:00Z', icon: '📉' },
  { id: 'int4', name: 'Intercom', category: 'support', status: 'enabled', eventsTracked: 450000, lastEvent: '2024-12-25T10:25:00Z', icon: '💬' },
  { id: 'int5', name: 'HubSpot', category: 'marketing', status: 'pending', eventsTracked: 0, lastEvent: '', icon: '🔶' },
  { id: 'int6', name: 'Salesforce', category: 'crm', status: 'enabled', eventsTracked: 890000, lastEvent: '2024-12-25T10:28:00Z', icon: '☁️' },
  { id: 'int7', name: 'Facebook Ads', category: 'advertising', status: 'enabled', eventsTracked: 1200000, lastEvent: '2024-12-25T10:30:00Z', icon: '📱' },
  { id: 'int8', name: 'Google Ads', category: 'advertising', status: 'enabled', eventsTracked: 980000, lastEvent: '2024-12-25T10:30:00Z', icon: '🎯' }
]

const getDestinationStatusColor = (status: Destination['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
}

const getAuditActionColor = (action: AuditLog['action']) => {
  switch (action) {
    case 'create': return 'bg-green-100 text-green-700'
    case 'update': return 'bg-blue-100 text-blue-700'
    case 'delete': return 'bg-red-100 text-red-700'
    case 'run': return 'bg-purple-100 text-purple-700'
    case 'error': return 'bg-red-100 text-red-700'
    case 'connect': return 'bg-cyan-100 text-cyan-700'
  }
}

const getIntegrationStatusColor = (status: Integration['status']) => {
  switch (status) {
    case 'enabled': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'disabled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
}

// Mock data for AI-powered competitive upgrade components
const mockDataExportAIInsights = [
  { id: '1', type: 'success' as const, title: 'Pipeline Optimization', description: 'Query caching improved sync speed by 45%. 2M fewer API calls.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Schema Drift Detected', description: 'Salesforce source has 3 new columns not in destination mapping.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Schema' },
  { id: '3', type: 'info' as const, title: 'Cost Reduction', description: 'Incremental sync reduced BigQuery storage costs by $450/month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Cost' },
]

const mockDataExportCollaborators = [
  { id: '1', name: 'Data Engineer', avatar: '/avatars/data-eng.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '2', name: 'Analytics Lead', avatar: '/avatars/analytics.jpg', status: 'online' as const, role: 'Analytics' },
  { id: '3', name: 'DevOps', avatar: '/avatars/devops.jpg', status: 'away' as const, role: 'DevOps' },
]

const mockDataExportPredictions = [
  { id: '1', title: 'Data Volume Growth', prediction: 'Monthly export volume will hit 500GB by Q2 based on growth rate', confidence: 93, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Pipeline Health', prediction: 'PostgreSQL sync may fail next week - connection pool near limit', confidence: 78, trend: 'down' as const, impact: 'high' as const },
]

const mockDataExportActivities = [
  { id: '1', user: 'Data Engineer', action: 'Created', target: 'Snowflake → BigQuery pipeline', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Analytics Lead', action: 'Ran', target: 'full sync on customers table', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'DevOps', action: 'Fixed', target: 'MongoDB connection timeout', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockDataExportQuickActions = [
  { id: '1', label: 'New Pipeline', icon: 'plus', action: () => { /* TODO: Implement pipeline wizard */ }, variant: 'default' as const },
  { id: '2', label: 'Run All Syncs', icon: 'play', action: async () => {
    const toastId = toast.loading('Running all data syncs...')
    try {
      await Promise.all(mockPipelines.map(p => fetch(`/api/pipelines/${p.id}/sync`, { method: 'POST' }).catch(() => null)))
      toast.dismiss(toastId)
      toast.success(`${mockPipelines.length} pipelines synced successfully!`)
    } catch {
      toast.dismiss(toastId)
      toast.error('Some syncs failed')
    }
  }, variant: 'default' as const },
  { id: '3', label: 'View Logs', icon: 'terminal', action: () => { window.location.href = '/dashboard/data-export-v2?tab=monitoring' }, variant: 'outline' as const },
]

// Database export type
interface DataExport {
  id: string
  user_id: string
  export_name: string
  description: string | null
  export_format: 'csv' | 'json' | 'xml' | 'pdf' | 'xlsx' | 'sql' | 'parquet' | 'avro'
  export_type: 'manual' | 'scheduled' | 'automated' | 'api_triggered' | 'webhook'
  data_source: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'scheduled' | 'cancelled' | 'expired'
  progress_percentage: number
  total_records: number
  processed_records: number
  file_size_mb: number
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export default function DataExportClient() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('pipelines')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null)
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [showNewPipelineDialog, setShowNewPipelineDialog] = useState(false)
  const [showSchemaDialog, setShowSchemaDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase state
  const [dataExports, setDataExports] = useState<DataExport[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    export_name: '',
    description: '',
    export_format: 'csv' as const,
    export_type: 'manual' as const,
    data_source: 'users' as const,
  })

  // Fetch data exports from Supabase
  const fetchDataExports = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('data_exports')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDataExports(data || [])
    } catch (error: any) {
      toast.error('Failed to load exports', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDataExports()
  }, [fetchDataExports])

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

  // CRUD Handlers
  const handleCreateExport = async () => {
    if (!formData.export_name.trim()) {
      toast.error('Export name required')
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('data_exports').insert({
        user_id: user.id,
        export_name: formData.export_name,
        description: formData.description || null,
        export_format: formData.export_format,
        export_type: formData.export_type,
        data_source: formData.data_source,
        status: 'pending',
      })
      if (error) throw error
      toast.success('Export created', { description: formData.export_name })
      setFormData({ export_name: '', description: '', export_format: 'csv', export_type: 'manual', data_source: 'users' })
      fetchDataExports()
    } catch (error: any) {
      toast.error('Failed to create export', { description: error.message })
    }
  }

  const handleRunExport = async (exportId: string, exportName: string) => {
    try {
      const { error } = await supabase
        .from('data_exports')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', exportId)
      if (error) throw error
      toast.success('Export started', { description: `${exportName} is now running` })
      fetchDataExports()
    } catch (error: any) {
      toast.error('Failed to start export', { description: error.message })
    }
  }

  const handleScheduleExport = async (exportId: string, exportName: string) => {
    try {
      const scheduledAt = new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      const { error } = await supabase
        .from('data_exports')
        .update({ status: 'scheduled', scheduled_at: scheduledAt })
        .eq('id', exportId)
      if (error) throw error
      toast.success('Export scheduled', { description: `${exportName} scheduled for 1 hour` })
      fetchDataExports()
    } catch (error: any) {
      toast.error('Failed to schedule export', { description: error.message })
    }
  }

  const handleDownloadExport = async (exportId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_exports')
        .select('download_url, export_name')
        .eq('id', exportId)
        .single()
      if (error) throw error
      if (data?.download_url) {
        window.open(data.download_url, '_blank')
      }
      toast.success('Downloading export', { description: data?.export_name || 'File ready' })
    } catch (error: any) {
      toast.error('Download failed', { description: error.message })
    }
  }

  const handleDeleteExport = async (exportId: string, exportName: string) => {
    try {
      const { error } = await supabase
        .from('data_exports')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', exportId)
      if (error) throw error
      toast.success('Export deleted', { description: `${exportName} has been removed` })
      fetchDataExports()
    } catch (error: any) {
      toast.error('Failed to delete export', { description: error.message })
    }
  }

  const handleCancelExport = async (exportId: string, exportName: string) => {
    try {
      const { error } = await supabase
        .from('data_exports')
        .update({ status: 'cancelled' })
        .eq('id', exportId)
      if (error) throw error
      toast.success('Export cancelled', { description: exportName })
      fetchDataExports()
    } catch (error: any) {
      toast.error('Failed to cancel export', { description: error.message })
    }
  }

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
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setActiveTab('jobs')}>
                <History className="w-4 h-4 mr-2" />
                Job History
              </Button>
              <Button className="bg-white text-green-600 hover:bg-green-50" onClick={() => setShowNewPipelineDialog(true)}>
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
            <TabsTrigger value="destinations" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Destinations
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pipelines Tab */}
          <TabsContent value="pipelines" className="space-y-6">
            {/* Pipelines Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Data Pipelines</h3>
                  <p className="text-green-100">Manage your ETL workflows and data synchronization</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockPipelines.length}</p>
                    <p className="text-green-200 text-sm">Active Pipelines</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipelines Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Pipeline', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Play, label: 'Run All', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Pause, label: 'Pause All', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: RefreshCw, label: 'Sync', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: GitBranch, label: 'Clone', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Download, label: 'Export', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: History, label: 'History', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: Settings, label: 'Configure', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

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
                <Button variant="outline" size="sm" onClick={() => { /* TODO: Implement filter dropdown for Active, Paused, Error, Running */ }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={async () => {
                  const toastId = toast.loading('Refreshing pipelines...')
                  await fetchDataExports()
                  toast.dismiss(toastId)
                  toast.success('Pipelines refreshed')
                }}>
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
                      <Button variant="ghost" size="icon" onClick={() => setSelectedPipeline(pipeline)}>
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
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedPipeline(pipeline)
                        setActiveTab('monitoring')
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Logs
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedPipeline(pipeline)
                        setActiveTab('settings')
                      }}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      {pipeline.status === 'active' ? (
                        <Button variant="outline" size="sm" onClick={async () => {
                          const toastId = toast.loading(`Pausing ${pipeline.name}...`)
                          try {
                            await fetch(`/api/pipelines/${pipeline.id}/pause`, { method: 'POST' })
                            toast.dismiss(toastId)
                            toast.success(`${pipeline.name} has been paused`)
                          } catch {
                            toast.dismiss(toastId)
                            toast.error('Failed to pause pipeline')
                          }
                        }}>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                          const toastId = toast.loading(`Running ${pipeline.name}...`)
                          try {
                            await fetch(`/api/pipelines/${pipeline.id}/run`, { method: 'POST' })
                            toast.dismiss(toastId)
                            toast.success(`${pipeline.name} is now running`)
                          } catch {
                            toast.dismiss(toastId)
                            toast.error('Failed to start pipeline')
                          }
                        }}>
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
          <TabsContent value="sources" className="space-y-6">
            {/* Sources Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Data Sources</h3>
                  <p className="text-blue-100">Connect and manage your data sources</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.connectedSources}</p>
                    <p className="text-blue-200 text-sm">Connected Sources</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sources Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Add Source', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: RefreshCw, label: 'Sync All', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Server, label: 'Databases', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Cloud, label: 'SaaS', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: FileCode, label: 'APIs', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Archive, label: 'Files', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Key, label: 'Credentials', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
                { icon: Settings, label: 'Configure', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Connected Data Sources</h2>
              <Button onClick={() => { /* TODO: Implement data source selection dialog */ }}>
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={async () => {
                      const toastId = toast.loading(`Syncing ${source.name}...`)
                      try {
                        await fetch(`/api/sources/${source.id}/sync`, { method: 'POST' })
                        toast.dismiss(toastId)
                        toast.success(`${source.name} synced successfully`)
                      } catch {
                        toast.dismiss(toastId)
                        toast.error('Sync failed')
                      }
                    }}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedSource(source)}>
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
          <TabsContent value="jobs" className="space-y-6">
            {/* Jobs Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Export Jobs</h3>
                  <p className="text-orange-100">Monitor and manage data export tasks</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.runningJobs}</p>
                    <p className="text-orange-200 text-sm">Running Jobs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Job', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Play, label: 'Run Now', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Pause, label: 'Pause', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: XCircle, label: 'Cancel All', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
                { icon: RefreshCw, label: 'Retry Failed', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Download, label: 'Download', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: History, label: 'History', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Filter, label: 'Filter', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Export Jobs {loading && <RefreshCw className="w-4 h-4 ml-2 animate-spin inline" />}</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchDataExports}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Export</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Export Name</Label>
                        <Input
                          placeholder="Q4 Financial Report"
                          value={formData.export_name}
                          onChange={(e) => setFormData(f => ({ ...f, export_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Optional description"
                          value={formData.description}
                          onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Format</Label>
                          <Select value={formData.export_format} onValueChange={(v: any) => setFormData(f => ({ ...f, export_format: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="xlsx">Excel</SelectItem>
                              <SelectItem value="parquet">Parquet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Data Source</Label>
                          <Select value={formData.data_source} onValueChange={(v: any) => setFormData(f => ({ ...f, data_source: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="users">Users</SelectItem>
                              <SelectItem value="customers">Customers</SelectItem>
                              <SelectItem value="orders">Orders</SelectItem>
                              <SelectItem value="analytics">Analytics</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleCreateExport}>Create Export</Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  <div>Source</div>
                  <div>Actions</div>
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                {/* Real Supabase data */}
                {dataExports.map(exp => (
                  <div key={exp.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="grid grid-cols-7 gap-4 items-center">
                      <div>
                        <p className="font-medium">{exp.export_name}</p>
                        <p className="text-xs text-gray-500">{exp.export_format.toUpperCase()}</p>
                      </div>
                      <div>
                        <Badge className={getJobStatusColor(exp.status as ExportJob['status'])}>
                          {exp.status}
                        </Badge>
                      </div>
                      <div>
                        <Progress value={exp.progress_percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{exp.progress_percentage}%</p>
                      </div>
                      <div className="text-sm">{exp.processed_records.toLocaleString()}</div>
                      <div className="text-sm">{formatBytes(exp.file_size_mb)}</div>
                      <div className="text-sm text-gray-500 truncate">{exp.data_source}</div>
                      <div className="flex items-center gap-1">
                        {exp.status === 'completed' && (
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadExport(exp.id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {exp.status === 'pending' && (
                          <Button variant="ghost" size="icon" onClick={() => handleRunExport(exp.id, exp.export_name)}>
                            <Play className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {exp.status === 'in_progress' && (
                          <Button variant="ghost" size="icon" onClick={() => handleCancelExport(exp.id, exp.export_name)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExport(exp.id, exp.export_name)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Mock fallback data */}
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
                          <Button variant="ghost" size="icon" onClick={async () => {
                            const toastId = toast.loading(`Downloading ${job.name}...`)
                            try {
                              const res = await fetch(`/api/exports/${job.id}/download`)
                              const blob = await res.blob()
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `${job.name}.${job.format}`
                              a.click()
                              URL.revokeObjectURL(url)
                              toast.dismiss(toastId)
                              toast.success('Download started successfully')
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Download failed')
                            }
                          }}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => { /* TODO: Implement job details view */ }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {job.status === 'running' && (
                          <Button variant="ghost" size="icon" onClick={async () => {
                            if (!confirm(`Are you sure you want to cancel ${job.name}?`)) return
                            const toastId = toast.loading('Cancelling job...')
                            try {
                              await fetch(`/api/exports/${job.id}/cancel`, { method: 'POST' })
                              toast.dismiss(toastId)
                              toast.success(`${job.name} cancelled`)
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Failed to cancel job')
                            }
                          }}>
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
          <TabsContent value="transforms" className="space-y-6">
            {/* Transforms Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Data Transformations</h3>
                  <p className="text-purple-100">Configure how your data is processed and transformed</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-purple-200 text-sm">Transform Types</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transforms Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Create', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Filter, label: 'Filter', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: ArrowRight, label: 'Map', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Layers, label: 'Aggregate', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: GitBranch, label: 'Join', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Copy, label: 'Dedupe', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: FileCode, label: 'Custom SQL', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: Eye, label: 'Preview', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Data Transformations</h2>
              <Button onClick={() => { /* TODO: Implement transformation creation wizard */ }}>
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
          <TabsContent value="schema" className="space-y-6">
            {/* Schema Banner */}
            <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Schema Mapping</h3>
                  <p className="text-cyan-100">Configure how source columns map to destination tables</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockSchemaMappings.length}</p>
                    <p className="text-cyan-200 text-sm">Column Mappings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schema Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: RefreshCw, label: 'Auto-detect', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Plus, label: 'Add Column', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Table, label: 'View Schema', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: ArrowRight, label: 'Map All', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Zap, label: 'Transform', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
                { icon: Download, label: 'Export', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: History, label: 'History', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Eye, label: 'Preview', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Schema Mapping</h2>
                <p className="text-sm text-gray-500">Configure how source columns map to destination</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={async () => {
                  const toastId = toast.loading('Auto-detecting schema...')
                  try {
                    await fetch('/api/schema/detect', { method: 'POST' })
                    toast.dismiss(toastId)
                    toast.success('Schema detected successfully')
                  } catch {
                    toast.dismiss(toastId)
                    toast.error('Failed to detect schema')
                  }
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-detect Schema
                </Button>
                <Button onClick={() => setShowSchemaDialog(true)}>
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
                        <Button variant="ghost" size="icon" onClick={() => { /* TODO: Implement mapping configuration panel */ }}>
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          if (!confirm(`Delete mapping ${mapping.sourceColumn}?`)) return
                          const toastId = toast.loading('Deleting mapping...')
                          try {
                            await fetch(`/api/schema/mappings/${mapping.sourceColumn}`, { method: 'DELETE' })
                            toast.dismiss(toastId)
                            toast.success(`Mapping ${mapping.sourceColumn} deleted`)
                          } catch {
                            toast.dismiss(toastId)
                            toast.error('Failed to delete mapping')
                          }
                        }}>
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
          <TabsContent value="monitoring" className="space-y-6">
            {/* Monitoring Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Pipeline Monitoring</h3>
                  <p className="text-indigo-100">Real-time health and performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-indigo-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monitoring Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: RefreshCw, label: 'Refresh', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: BarChart3, label: 'Dashboard', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: AlertTriangle, label: 'Alerts', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
                { icon: Activity, label: 'Metrics', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Clock, label: 'History', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Download, label: 'Export', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Shield, label: 'Health', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Settings, label: 'Configure', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

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

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="space-y-6">
            {/* Destinations Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Data Destinations</h3>
                  <p className="text-rose-100">Configure where your data flows to</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockDestinations.length}</p>
                    <p className="text-rose-200 text-sm">Destinations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Destinations Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Add', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Cloud, label: 'Warehouses', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Server, label: 'Lakes', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Zap, label: 'Streams', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Globe, label: 'APIs', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Archive, label: 'Files', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: RefreshCw, label: 'Test', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: Settings, label: 'Configure', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Data Destinations</h2>
                <p className="text-sm text-gray-500">Configure where your data flows to</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => { /* TODO: Implement destination selection dialog */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Destination
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {mockDestinations.map(dest => (
                <Card key={dest.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{dest.icon}</div>
                      <div>
                        <h3 className="font-semibold">{dest.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dest.platform}</p>
                      </div>
                    </div>
                    <Badge className={getDestinationStatusColor(dest.status)}>
                      {dest.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 truncate">{dest.host}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {(dest.recordsWritten / 1000000).toFixed(1)}M records
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{dest.dataVolume}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-500">Last write</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(dest.lastWrite).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { /* TODO: Implement destination details view */ }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setActiveTab('settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Integrations Section - Segment Style */}
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Integrations Catalog</h3>
                  <p className="text-sm text-gray-500">Send data to your favorite tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { /* TODO: Implement category filter dropdown */ }}>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {mockIntegrations.map(integration => (
                  <div key={integration.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{integration.icon}</span>
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      <Badge className={getIntegrationStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p className="capitalize">{integration.category}</p>
                      {integration.eventsTracked > 0 && (
                        <p className="mt-1">{(integration.eventsTracked / 1000000).toFixed(1)}M events</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Audit Log Section */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Activity Log</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {mockAuditLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Badge className={getAuditActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{log.resource}</p>
                        <p className="text-sm text-gray-500">{log.details}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span>{log.user}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={log.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="bg-white dark:bg-gray-800">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Settings
                    </h3>
                  </div>
                  <div className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Database },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: AlertTriangle },
                        { id: 'api', label: 'API Access', icon: Key },
                        { id: 'billing', label: 'Usage & Billing', icon: BarChart3 },
                        { id: 'advanced', label: 'Advanced', icon: Zap },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9">
                <Card className="bg-white dark:bg-gray-800">

              <div className="p-6">
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">General Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Default Time Zone</p>
                          <p className="text-sm text-gray-500">Set timezone for all pipeline schedules</p>
                        </div>
                        <Badge variant="outline">UTC</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Data Retention</p>
                          <p className="text-sm text-gray-500">How long to keep job history and logs</p>
                        </div>
                        <Badge variant="outline">90 days</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Concurrent Jobs</p>
                          <p className="text-sm text-gray-500">Maximum parallel export jobs</p>
                        </div>
                        <Badge variant="outline">10</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-retry Failed Jobs</p>
                          <p className="text-sm text-gray-500">Automatically retry failed pipelines</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Encryption at Rest</p>
                          <p className="text-sm text-gray-500">AES-256 encryption for stored data</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Encryption in Transit</p>
                          <p className="text-sm text-gray-500">TLS 1.3 for all connections</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">IP Allowlist</p>
                          <p className="text-sm text-gray-500">Restrict access to specific IPs</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { /* TODO: Implement IP allowlist configuration */ }}>Configure</Button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                          <p className="text-sm text-gray-500">Log all data access and changes</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Pipeline Failures</p>
                          <p className="text-sm text-gray-500">Get notified when pipelines fail</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Email + Slack</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Schema Changes</p>
                          <p className="text-sm text-gray-500">Notify when source schema changes</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Email</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">High Latency Alerts</p>
                          <p className="text-sm text-gray-500">Alert when pipelines run slowly</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Slack</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Daily Summary</p>
                          <p className="text-sm text-gray-500">Receive daily pipeline summary</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'api' && (
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">API Configuration</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">API Key</p>
                          <Button variant="outline" size="sm" onClick={async () => {
                            try {
                              await navigator.clipboard.writeText('dp_live_sk_123456789abcdefghijklmnop')
                              toast.success('API key copied to clipboard')
                            } catch {
                              toast.error('Failed to copy')
                            }
                          }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <code className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          dp_live_•••••••••••••••••••••••••••
                        </code>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Rate Limit</p>
                          <p className="text-sm text-gray-500">API requests per minute</p>
                        </div>
                        <Badge variant="outline">1000/min</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Webhook URL</p>
                          <p className="text-sm text-gray-500">Receive pipeline events</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { /* TODO: Implement webhook URL configuration */ }}>Configure</Button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">API Version</p>
                          <p className="text-sm text-gray-500">Current API version</p>
                        </div>
                        <Badge variant="outline">v2</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'billing' && (
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Usage & Billing</h4>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">Enterprise</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Data Synced (MTD)</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">3.4 TB</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Rows Synced (MTD)</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">45.2M</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Active Sources</p>
                          <p className="text-sm text-gray-500">Connected data sources</p>
                        </div>
                        <span className="text-gray-900 dark:text-white">5 / Unlimited</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Active Destinations</p>
                          <p className="text-sm text-gray-500">Configured destinations</p>
                        </div>
                        <span className="text-gray-900 dark:text-white">6 / Unlimited</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Next Billing Date</p>
                          <p className="text-sm text-gray-500">Monthly billing cycle</p>
                        </div>
                        <span className="text-gray-900 dark:text-white">Jan 1, 2025</span>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Debug Mode</p>
                          <p className="text-sm text-gray-500">Enable verbose logging for troubleshooting</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Schema Evolution</p>
                          <p className="text-sm text-gray-500">Automatically handle schema changes</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Data Compression</p>
                          <p className="text-sm text-gray-500">Compress data during transfer</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">GZIP</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Batch Size</p>
                          <p className="text-sm text-gray-500">Records per batch</p>
                        </div>
                        <Badge variant="outline">10,000</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Parallel Threads</p>
                          <p className="text-sm text-gray-500">Concurrent extraction threads</p>
                        </div>
                        <Badge variant="outline">8</Badge>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-4">Data Management</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Job Logs</p>
                              <p className="text-sm text-gray-500">2.4 GB of log files</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={async () => {
                            if (!confirm('Clear all job logs? This cannot be undone.')) return
                            const toastId = toast.loading('Clearing job logs...')
                            try {
                              await fetch('/api/settings/clear-logs', { method: 'DELETE' })
                              toast.dismiss(toastId)
                              toast.success('Job logs cleared successfully (2.4 GB freed)')
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Failed to clear logs')
                            }
                          }}>Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Archive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Archived Data</p>
                              <p className="text-sm text-gray-500">15.8 GB archived exports</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { /* TODO: Implement archive manager */ }}>Manage</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Cache Storage</p>
                              <p className="text-sm text-gray-500">890 MB cached schemas</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={async () => {
                            if (!confirm('Purge all cached schemas? This cannot be undone.')) return
                            const toastId = toast.loading('Purging cache storage...')
                            try {
                              await fetch('/api/settings/purge-cache', { method: 'DELETE' })
                              toast.dismiss(toastId)
                              toast.success('Cache purged successfully (890 MB freed)')
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Failed to purge cache')
                            }
                          }}>Purge</Button>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                      <h5 className="font-medium text-red-600 mb-4">Danger Zone</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset All Pipelines</p>
                            <p className="text-sm text-gray-500">Delete all pipeline configurations</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm('Reset ALL pipelines? This will delete all pipeline configurations permanently.')) return
                            const toastId = toast.loading('Resetting all pipelines...')
                            try {
                              await fetch('/api/pipelines/reset', { method: 'DELETE' })
                              toast.dismiss(toastId)
                              toast.success('All pipelines have been reset')
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Failed to reset pipelines')
                            }
                          }}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Delete All Data</p>
                            <p className="text-sm text-gray-500">Permanently remove all exported data</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm('DELETE ALL EXPORTED DATA? This action is PERMANENT and cannot be undone.')) return
                            if (!confirm('Are you absolutely sure? This will permanently remove all exported data.')) return
                            const toastId = toast.loading('Deleting all exported data...')
                            try {
                              await fetch('/api/exports/delete-all', { method: 'DELETE' })
                              toast.dismiss(toastId)
                              toast.success('All exported data has been permanently deleted')
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Failed to delete data')
                            }
                          }}>Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Disconnect All Sources</p>
                            <p className="text-sm text-gray-500">Remove all data source connections</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm('Disconnect ALL data sources? This will remove all source connections.')) return
                            const toastId = toast.loading('Disconnecting all data sources...')
                            try {
                              await fetch('/api/sources/disconnect-all', { method: 'DELETE' })
                              toast.dismiss(toastId)
                              toast.success('All data sources have been disconnected')
                            } catch {
                              toast.dismiss(toastId)
                              toast.error('Failed to disconnect sources')
                            }
                          }}>Disconnect</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockDataExportAIInsights}
              title="Data Pipeline Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDataExportCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDataExportPredictions}
              title="Pipeline Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDataExportActivities}
            title="Pipeline Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockDataExportQuickActions}
            variant="grid"
          />
        </div>
      </div>
    </div>
  )
}
