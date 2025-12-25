'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  HardDrive,
  Database,
  Server,
  Cloud,
  CloudUpload,
  Download,
  Upload,
  Archive,
  Shield,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCw,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  FileArchive,
  FolderSync,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  History,
  Layers,
  Box,
  Cpu,
  Wifi,
  Globe,
  Timer,
  Target,
  CheckCheck
} from 'lucide-react'

// Types
type BackupStatus = 'completed' | 'running' | 'failed' | 'scheduled' | 'cancelled' | 'warning'
type BackupType = 'full' | 'incremental' | 'differential' | 'snapshot' | 'synthetic' | 'archive'
type StorageType = 'local' | 'aws-s3' | 'azure-blob' | 'google-cloud' | 'wasabi' | 'nfs'
type JobFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'continuous'

interface BackupJob {
  id: string
  name: string
  description: string
  type: BackupType
  status: BackupStatus
  source: string
  destination: string
  storageType: StorageType
  frequency: JobFrequency
  lastRun: string
  nextRun: string
  duration: number
  sizeBytes: number
  filesCount: number
  progress: number
  retentionDays: number
  encrypted: boolean
  compressed: boolean
  verified: boolean
  successRate: number
  restorePoints: number
  rpo: number // Recovery Point Objective in hours
  rto: number // Recovery Time Objective in minutes
}

interface StorageRepository {
  id: string
  name: string
  type: StorageType
  capacity: number
  used: number
  free: number
  status: 'online' | 'offline' | 'degraded' | 'syncing'
  backupCount: number
  lastBackup: string
  region?: string
  tier: 'hot' | 'cool' | 'archive'
}

interface RecoveryPoint {
  id: string
  jobId: string
  jobName: string
  timestamp: string
  type: BackupType
  size: number
  status: 'available' | 'expired' | 'locked'
  verified: boolean
  retentionUntil: string
}

interface BackupPolicy {
  id: string
  name: string
  description: string
  frequency: JobFrequency
  retentionDays: number
  fullBackupDay: string
  incrementalEnabled: boolean
  encryption: boolean
  compression: boolean
  verification: boolean
  jobCount: number
  isDefault: boolean
}

// Mock data
const mockJobs: BackupJob[] = [
  {
    id: '1',
    name: 'Production Database Backup',
    description: 'Full backup of PostgreSQL production database',
    type: 'full',
    status: 'completed',
    source: 'prod-db-cluster',
    destination: 'aws-s3-backup-vault',
    storageType: 'aws-s3',
    frequency: 'daily',
    lastRun: '2024-01-15T03:00:00Z',
    nextRun: '2024-01-16T03:00:00Z',
    duration: 1845,
    sizeBytes: 52428800000,
    filesCount: 1,
    progress: 100,
    retentionDays: 30,
    encrypted: true,
    compressed: true,
    verified: true,
    successRate: 99.8,
    restorePoints: 28,
    rpo: 24,
    rto: 30
  },
  {
    id: '2',
    name: 'Application Servers Backup',
    description: 'Incremental backup of all application servers',
    type: 'incremental',
    status: 'running',
    source: 'app-servers-group',
    destination: 'azure-backup-vault',
    storageType: 'azure-blob',
    frequency: 'hourly',
    lastRun: '2024-01-15T14:00:00Z',
    nextRun: '2024-01-15T15:00:00Z',
    duration: 0,
    sizeBytes: 8589934592,
    filesCount: 45678,
    progress: 67,
    retentionDays: 7,
    encrypted: true,
    compressed: true,
    verified: false,
    successRate: 98.5,
    restorePoints: 168,
    rpo: 1,
    rto: 15
  },
  {
    id: '3',
    name: 'User Data Snapshot',
    description: 'Snapshot backup of user uploads and documents',
    type: 'snapshot',
    status: 'scheduled',
    source: 'user-data-volume',
    destination: 'gcs-backup-bucket',
    storageType: 'google-cloud',
    frequency: 'weekly',
    lastRun: '2024-01-08T06:00:00Z',
    nextRun: '2024-01-15T06:00:00Z',
    duration: 3600,
    sizeBytes: 107374182400,
    filesCount: 1250000,
    progress: 0,
    retentionDays: 90,
    encrypted: true,
    compressed: false,
    verified: true,
    successRate: 100,
    restorePoints: 12,
    rpo: 168,
    rto: 60
  },
  {
    id: '4',
    name: 'Configuration Backup',
    description: 'Backup of all system configurations and secrets',
    type: 'differential',
    status: 'failed',
    source: 'config-server',
    destination: 'local-nas-backup',
    storageType: 'local',
    frequency: 'daily',
    lastRun: '2024-01-15T02:00:00Z',
    nextRun: '2024-01-16T02:00:00Z',
    duration: 120,
    sizeBytes: 1073741824,
    filesCount: 5678,
    progress: 45,
    retentionDays: 14,
    encrypted: true,
    compressed: true,
    verified: false,
    successRate: 92.3,
    restorePoints: 10,
    rpo: 24,
    rto: 10
  },
  {
    id: '5',
    name: 'Email Server Backup',
    description: 'Full backup of Exchange email server',
    type: 'full',
    status: 'warning',
    source: 'exchange-server',
    destination: 'wasabi-backup-bucket',
    storageType: 'wasabi',
    frequency: 'daily',
    lastRun: '2024-01-15T04:00:00Z',
    nextRun: '2024-01-16T04:00:00Z',
    duration: 7200,
    sizeBytes: 214748364800,
    filesCount: 1,
    progress: 100,
    retentionDays: 60,
    encrypted: true,
    compressed: true,
    verified: true,
    successRate: 97.5,
    restorePoints: 55,
    rpo: 24,
    rto: 120
  }
]

const mockRepositories: StorageRepository[] = [
  { id: '1', name: 'AWS S3 Backup Vault', type: 'aws-s3', capacity: 1099511627776, used: 549755813888, free: 549755813888, status: 'online', backupCount: 156, lastBackup: '5 min ago', region: 'us-east-1', tier: 'hot' },
  { id: '2', name: 'Azure Blob Storage', type: 'azure-blob', capacity: 549755813888, used: 274877906944, free: 274877906944, status: 'online', backupCount: 89, lastBackup: '2 min ago', region: 'eastus', tier: 'hot' },
  { id: '3', name: 'Google Cloud Storage', type: 'google-cloud', capacity: 274877906944, used: 137438953472, free: 137438953472, status: 'syncing', backupCount: 45, lastBackup: '1 hour ago', region: 'us-central1', tier: 'cool' },
  { id: '4', name: 'Local NAS Storage', type: 'local', capacity: 8796093022208, used: 4398046511104, free: 4398046511104, status: 'online', backupCount: 234, lastBackup: '30 min ago', tier: 'hot' },
  { id: '5', name: 'Wasabi Cold Storage', type: 'wasabi', capacity: 2199023255552, used: 1649267441664, free: 549755813888, status: 'online', backupCount: 78, lastBackup: '2 hours ago', region: 'us-east-1', tier: 'archive' }
]

const mockRecoveryPoints: RecoveryPoint[] = [
  { id: '1', jobId: '1', jobName: 'Production Database Backup', timestamp: '2024-01-15T03:00:00Z', type: 'full', size: 52428800000, status: 'available', verified: true, retentionUntil: '2024-02-14' },
  { id: '2', jobId: '2', jobName: 'Application Servers Backup', timestamp: '2024-01-15T14:00:00Z', type: 'incremental', size: 2147483648, status: 'available', verified: true, retentionUntil: '2024-01-22' },
  { id: '3', jobId: '1', jobName: 'Production Database Backup', timestamp: '2024-01-14T03:00:00Z', type: 'full', size: 51539607552, status: 'available', verified: true, retentionUntil: '2024-02-13' },
  { id: '4', jobId: '3', jobName: 'User Data Snapshot', timestamp: '2024-01-08T06:00:00Z', type: 'snapshot', size: 107374182400, status: 'locked', verified: true, retentionUntil: '2024-04-08' },
  { id: '5', jobId: '5', jobName: 'Email Server Backup', timestamp: '2024-01-15T04:00:00Z', type: 'full', size: 214748364800, status: 'available', verified: false, retentionUntil: '2024-03-15' }
]

const mockPolicies: BackupPolicy[] = [
  { id: '1', name: 'Enterprise Standard', description: 'Daily full backup with 30-day retention', frequency: 'daily', retentionDays: 30, fullBackupDay: 'Sunday', incrementalEnabled: true, encryption: true, compression: true, verification: true, jobCount: 12, isDefault: true },
  { id: '2', name: 'High Frequency', description: 'Hourly incremental for critical systems', frequency: 'hourly', retentionDays: 7, fullBackupDay: 'Saturday', incrementalEnabled: true, encryption: true, compression: true, verification: false, jobCount: 5, isDefault: false },
  { id: '3', name: 'Long-Term Archive', description: 'Weekly full backup with 1-year retention', frequency: 'weekly', retentionDays: 365, fullBackupDay: 'Sunday', incrementalEnabled: false, encryption: true, compression: true, verification: true, jobCount: 8, isDefault: false }
]

export default function BackupsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BackupStatus | 'all'>('all')
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, selectedStatus])

  // Compute stats
  const stats = useMemo(() => {
    const total = mockJobs.length
    const completed = mockJobs.filter(j => j.status === 'completed').length
    const running = mockJobs.filter(j => j.status === 'running').length
    const failed = mockJobs.filter(j => j.status === 'failed').length
    const totalSize = mockJobs.reduce((sum, j) => sum + j.sizeBytes, 0)
    const avgSuccess = mockJobs.reduce((sum, j) => sum + j.successRate, 0) / total
    const totalRestorePoints = mockJobs.reduce((sum, j) => sum + j.restorePoints, 0)
    return { total, completed, running, failed, totalSize, avgSuccess, totalRestorePoints }
  }, [])

  const statsCards = [
    { label: 'Total Jobs', value: stats.total.toString(), change: '+3', icon: Database, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: stats.completed.toString(), change: '+2', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { label: 'Running', value: stats.running.toString(), change: '', icon: Activity, color: 'from-amber-500 to-amber-600' },
    { label: 'Failed', value: stats.failed.toString(), change: '-1', icon: XCircle, color: 'from-red-500 to-red-600' },
    { label: 'Total Storage', value: formatSize(stats.totalSize), change: '+15%', icon: HardDrive, color: 'from-purple-500 to-purple-600' },
    { label: 'Success Rate', value: `${stats.avgSuccess.toFixed(1)}%`, change: '+2.3%', icon: TrendingUp, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Restore Points', value: stats.totalRestorePoints.toString(), change: '+28', icon: History, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Protected VMs', value: '47', change: '+5', icon: Server, color: 'from-emerald-500 to-emerald-600' }
  ]

  function formatSize(bytes: number): string {
    if (bytes >= 1099511627776) return `${(bytes / 1099511627776).toFixed(1)} TB`
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m ${seconds % 60}s`
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getStatusColor = (status: BackupStatus): string => {
    const colors: Record<BackupStatus, string> = {
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'running': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'warning': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    }
    return colors[status]
  }

  const getTypeColor = (type: BackupType): string => {
    const colors: Record<BackupType, string> = {
      'full': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'incremental': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'differential': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'snapshot': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'synthetic': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'archive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[type]
  }

  const getStorageIcon = (type: StorageType) => {
    const icons: Record<StorageType, any> = {
      'local': HardDrive,
      'aws-s3': Cloud,
      'azure-blob': Cloud,
      'google-cloud': Cloud,
      'wasabi': Archive,
      'nfs': Server
    }
    return icons[type] || Database
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Recovery</h1>
              <p className="text-gray-500 dark:text-gray-400">Enterprise data protection and disaster recovery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search backups..."
                className="w-72 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Backup Job
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
                {stat.change && (
                  <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change} this week
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Database className="h-4 w-4 mr-2" />
              Backup Jobs
            </TabsTrigger>
            <TabsTrigger value="recovery" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <History className="h-4 w-4 mr-2" />
              Recovery Points
            </TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <HardDrive className="h-4 w-4 mr-2" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Recent Jobs */}
              <Card className="col-span-8 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Backup Jobs</CardTitle>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockJobs.slice(0, 4).map(job => (
                      <div
                        key={job.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          job.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                          job.status === 'running' ? 'bg-blue-100 dark:bg-blue-900' :
                          job.status === 'failed' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {job.status === 'running' ? (
                            <RotateCw className="h-5 w-5 text-blue-600 animate-spin" />
                          ) : job.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : job.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{job.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{job.source}</span>
                            <span>→</span>
                            <span>{job.destination}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                        <div className="text-right">
                          <p className="font-medium">{formatSize(job.sizeBytes)}</p>
                          <p className="text-xs text-gray-500">{formatTime(job.lastRun)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Storage Overview */}
              <Card className="col-span-4 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Storage Repositories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRepositories.slice(0, 4).map(repo => {
                    const usedPercent = (repo.used / repo.capacity) * 100
                    const StorageIcon = getStorageIcon(repo.type)
                    return (
                      <div key={repo.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StorageIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{repo.name}</span>
                          </div>
                          <Badge className={repo.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {repo.status}
                          </Badge>
                        </div>
                        <Progress value={usedPercent} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatSize(repo.used)} used</span>
                          <span>{formatSize(repo.free)} free</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* RPO/RTO Overview */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Recovery Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">RPO Status</h4>
                      </div>
                      <p className="text-3xl font-bold text-blue-700 mb-1">98.5%</p>
                      <p className="text-sm text-gray-500">Jobs meeting RPO targets</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">RTO Status</h4>
                      </div>
                      <p className="text-3xl font-bold text-green-700 mb-1">99.2%</p>
                      <p className="text-sm text-gray-500">Jobs meeting RTO targets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Play className="h-6 w-6 mb-2 text-green-600" />
                      Run Backup Now
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Download className="h-6 w-6 mb-2 text-blue-600" />
                      Restore Data
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <ShieldCheck className="h-6 w-6 mb-2 text-purple-600" />
                      Verify Backups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant={selectedStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('all')}>All</Button>
              <Button variant={selectedStatus === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('completed')} className={selectedStatus === 'completed' ? 'bg-green-600' : ''}>Completed</Button>
              <Button variant={selectedStatus === 'running' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('running')} className={selectedStatus === 'running' ? 'bg-blue-600' : ''}>Running</Button>
              <Button variant={selectedStatus === 'failed' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('failed')} className={selectedStatus === 'failed' ? 'bg-red-600' : ''}>Failed</Button>
              <Button variant={selectedStatus === 'scheduled' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('scheduled')}>Scheduled</Button>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedJob(job)}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        job.status === 'completed' ? 'bg-green-100' : job.status === 'running' ? 'bg-blue-100' : job.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Database className={`h-6 w-6 ${
                          job.status === 'completed' ? 'text-green-600' : job.status === 'running' ? 'text-blue-600' : job.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{job.name}</h4>
                        <p className="text-sm text-gray-500">{job.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                      </div>
                      {job.status === 'running' && (
                        <div className="w-32">
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-xs text-gray-500 text-center mt-1">{job.progress}%</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-medium">{formatSize(job.sizeBytes)}</p>
                        <p className="text-xs text-gray-500">{job.filesCount.toLocaleString()} files</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.encrypted && <Lock className="h-4 w-4 text-green-600" />}
                        {job.verified && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recovery Points Tab */}
          <TabsContent value="recovery" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Available Recovery Points</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Start Recovery
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockRecoveryPoints.map(point => (
                    <div key={point.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{point.jobName}</h4>
                        <p className="text-sm text-gray-500">{new Date(point.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge className={getTypeColor(point.type)}>{point.type}</Badge>
                      <Badge className={point.status === 'available' ? 'bg-green-100 text-green-700' : point.status === 'locked' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                        {point.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">{formatSize(point.size)}</p>
                        <p className="text-xs text-gray-500">Until {point.retentionUntil}</p>
                      </div>
                      {point.verified && <ShieldCheck className="h-5 w-5 text-green-600" />}
                      <Button size="sm" variant="outline">Restore</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              {mockRepositories.map(repo => {
                const usedPercent = (repo.used / repo.capacity) * 100
                const StorageIcon = getStorageIcon(repo.type)
                return (
                  <Card key={repo.id} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                            <StorageIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{repo.name}</h3>
                            <p className="text-sm text-gray-500">{repo.region || 'Local'} • {repo.tier}</p>
                          </div>
                        </div>
                        <Badge className={repo.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                          {repo.status}
                        </Badge>
                      </div>
                      <Progress value={usedPercent} className="h-3 mb-2" />
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-500">{formatSize(repo.used)} of {formatSize(repo.capacity)}</span>
                        <span className={usedPercent > 80 ? 'text-red-600 font-medium' : 'text-green-600'}>{usedPercent.toFixed(1)}% used</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Backups:</span> <span className="font-medium">{repo.backupCount}</span></div>
                        <div><span className="text-gray-500">Last Backup:</span> <span className="font-medium">{repo.lastBackup}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="mt-6">
            <div className="grid grid-cols-3 gap-6">
              {mockPolicies.map(policy => (
                <Card key={policy.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{policy.name}</h3>
                      {policy.isDefault && <Badge>Default</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{policy.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Frequency:</span> <span className="font-medium capitalize">{policy.frequency}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Retention:</span> <span className="font-medium">{policy.retentionDays} days</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Jobs:</span> <span className="font-medium">{policy.jobCount}</span></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {policy.encryption && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Encrypted</Badge>}
                      {policy.compression && <Badge variant="outline"><FileArchive className="h-3 w-3 mr-1" />Compressed</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Backup Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">Automatic Verification</p><p className="text-sm text-gray-500">Verify backups after completion</p></div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">Encryption at Rest</p><p className="text-sm text-gray-500">Encrypt all backup data</p></div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">Compression</p><p className="text-sm text-gray-500">Compress backups to save storage</p></div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">Failure Alerts</p><p className="text-sm text-gray-500">Notify on backup failures</p></div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">Daily Summary</p><p className="text-sm text-gray-500">Send daily backup report</p></div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">Storage Warnings</p><p className="text-sm text-gray-500">Alert when storage is low</p></div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Job Detail Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-3xl">
            <ScrollArea className="max-h-[80vh]">
              {selectedJob && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <DialogTitle>{selectedJob.name}</DialogTitle>
                        <p className="text-gray-500">{selectedJob.description}</p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{formatSize(selectedJob.sizeBytes)}</p>
                      <p className="text-sm text-gray-500">Backup Size</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedJob.restorePoints}</p>
                      <p className="text-sm text-gray-500">Restore Points</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedJob.successRate}%</p>
                      <p className="text-sm text-gray-500">Success Rate</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700"><Play className="h-4 w-4 mr-2" />Run Now</Button>
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" />Restore</Button>
                    <Button variant="outline"><ShieldCheck className="h-4 w-4 mr-2" />Verify</Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
