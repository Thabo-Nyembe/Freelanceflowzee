'use client'

import { useState } from 'react'
import {
  HardDrive,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  Cloud,
  RotateCw,
  Download,
  Upload,
  Archive,
  Shield,
  Trash2,
  Calendar,
  Activity,
  TrendingUp,
  Zap,
  BarChart3,
  FileArchive,
  FolderSync,
  CloudUpload,
  Settings
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type BackupStatus = 'completed' | 'in-progress' | 'failed' | 'scheduled' | 'cancelled'
type BackupType = 'full' | 'incremental' | 'differential' | 'snapshot' | 'archive'
type BackupFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand'
type StorageLocation = 'local' | 'aws-s3' | 'google-cloud' | 'azure' | 'dropbox' | 'ftp'

interface Backup {
  id: string
  name: string
  type: BackupType
  status: BackupStatus
  frequency: BackupFrequency
  storage: StorageLocation
  size: number
  duration: number
  filesCount: number
  lastRun: string
  nextRun: string
  retention: number
  encrypted: boolean
  compressed: boolean
  verified: boolean
  successRate: number
}

export default function BackupsPage() {
  const [viewMode, setViewMode] = useState<'all' | BackupStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | BackupType>('all')

  const backups: Backup[] = [
    {
      id: 'BKP-2847',
      name: 'Production Database - Full Backup',
      type: 'full',
      status: 'completed',
      frequency: 'daily',
      storage: 'aws-s3',
      size: 45.6,
      duration: 1847,
      filesCount: 2847,
      lastRun: '2024-01-15 03:00',
      nextRun: '2024-01-16 03:00',
      retention: 30,
      encrypted: true,
      compressed: true,
      verified: true,
      successRate: 99.8
    },
    {
      id: 'BKP-2848',
      name: 'User Files - Incremental',
      type: 'incremental',
      status: 'in-progress',
      frequency: 'hourly',
      storage: 'google-cloud',
      size: 12.3,
      duration: 456,
      filesCount: 8473,
      lastRun: '2024-01-15 14:00',
      nextRun: '2024-01-15 15:00',
      retention: 7,
      encrypted: true,
      compressed: true,
      verified: false,
      successRate: 98.5
    },
    {
      id: 'BKP-2849',
      name: 'System Configuration Snapshot',
      type: 'snapshot',
      status: 'completed',
      frequency: 'weekly',
      storage: 'azure',
      size: 2.4,
      duration: 234,
      filesCount: 456,
      lastRun: '2024-01-14 00:00',
      nextRun: '2024-01-21 00:00',
      retention: 90,
      encrypted: true,
      compressed: false,
      verified: true,
      successRate: 100
    },
    {
      id: 'BKP-2850',
      name: 'Application Logs Archive',
      type: 'archive',
      status: 'failed',
      frequency: 'monthly',
      storage: 'local',
      size: 78.9,
      duration: 3456,
      filesCount: 12847,
      lastRun: '2024-01-01 01:00',
      nextRun: '2024-02-01 01:00',
      retention: 365,
      encrypted: false,
      compressed: true,
      verified: false,
      successRate: 94.2
    },
    {
      id: 'BKP-2851',
      name: 'Customer Data - Differential',
      type: 'differential',
      status: 'scheduled',
      frequency: 'daily',
      storage: 'dropbox',
      size: 23.7,
      duration: 892,
      filesCount: 4567,
      lastRun: '2024-01-14 02:00',
      nextRun: '2024-01-16 02:00',
      retention: 60,
      encrypted: true,
      compressed: true,
      verified: true,
      successRate: 97.6
    },
    {
      id: 'BKP-2852',
      name: 'Media Assets Backup',
      type: 'full',
      status: 'completed',
      frequency: 'weekly',
      storage: 'aws-s3',
      size: 156.8,
      duration: 5678,
      filesCount: 18473,
      lastRun: '2024-01-13 22:00',
      nextRun: '2024-01-20 22:00',
      retention: 180,
      encrypted: true,
      compressed: false,
      verified: true,
      successRate: 99.2
    }
  ]

  const filteredBackups = backups.filter(backup => {
    if (viewMode !== 'all' && backup.status !== viewMode) return false
    if (typeFilter !== 'all' && backup.type !== typeFilter) return false
    return true
  })

  const totalBackups = backups.length
  const completedBackups = backups.filter(b => b.status === 'completed').length
  const failedBackups = backups.filter(b => b.status === 'failed').length
  const totalStorage = backups.reduce((sum, b) => sum + b.size, 0)
  const avgSuccessRate = backups.reduce((sum, b) => sum + b.successRate, 0) / backups.length

  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'scheduled': return 'text-purple-600 bg-purple-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: BackupType) => {
    switch (type) {
      case 'full': return 'text-blue-600 bg-blue-50'
      case 'incremental': return 'text-green-600 bg-green-50'
      case 'differential': return 'text-purple-600 bg-purple-50'
      case 'snapshot': return 'text-orange-600 bg-orange-50'
      case 'archive': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStorageIcon = (storage: StorageLocation) => {
    switch (storage) {
      case 'aws-s3': return <Cloud className="w-4 h-4" />
      case 'google-cloud': return <CloudUpload className="w-4 h-4" />
      case 'azure': return <Server className="w-4 h-4" />
      case 'dropbox': return <FolderSync className="w-4 h-4" />
      case 'ftp': return <Upload className="w-4 h-4" />
      case 'local': return <HardDrive className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
            Backups
          </h1>
          <p className="text-slate-600">Manage system backups, storage, and recovery operations</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Backups',
              value: totalBackups.toString(),
              icon: Database,
              trend: { value: 12, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Completed Today',
              value: completedBackups.toString(),
              icon: CheckCircle2,
              trend: { value: 8, isPositive: true },
              color: 'green'
            },
            {
              label: 'Total Storage',
              value: `${totalStorage.toFixed(1)} GB`,
              icon: HardDrive,
              trend: { value: 15, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Success Rate',
              value: `${avgSuccessRate.toFixed(1)}%`,
              icon: Activity,
              trend: { value: 2.1, isPositive: true },
              color: 'orange'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Backup',
              description: 'Create manual backup',
              icon: Upload,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('New backup')
            },
            {
              title: 'Restore Data',
              description: 'Recover from backup',
              icon: Download,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Restore')
            },
            {
              title: 'Schedule Backup',
              description: 'Set up automation',
              icon: Calendar,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Schedule')
            },
            {
              title: 'Verify Backups',
              description: 'Check integrity',
              icon: Shield,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Verify')
            },
            {
              title: 'Storage Settings',
              description: 'Configure locations',
              icon: Settings,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Storage settings')
            },
            {
              title: 'Backup Reports',
              description: 'View analytics',
              icon: BarChart3,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Reports')
            },
            {
              title: 'Archive Old Data',
              description: 'Long-term storage',
              icon: Archive,
              gradient: 'from-gray-500 to-slate-600',
              onClick: () => console.log('Archive')
            },
            {
              title: 'Clean Up',
              description: 'Remove old backups',
              icon: Trash2,
              gradient: 'from-red-500 to-rose-600',
              onClick: () => console.log('Clean up')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Statuses"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Completed"
              isActive={viewMode === 'completed'}
              onClick={() => setViewMode('completed')}
            />
            <PillButton
              label="In Progress"
              isActive={viewMode === 'in-progress'}
              onClick={() => setViewMode('in-progress')}
            />
            <PillButton
              label="Failed"
              isActive={viewMode === 'failed'}
              onClick={() => setViewMode('failed')}
            />
            <PillButton
              label="Scheduled"
              isActive={viewMode === 'scheduled'}
              onClick={() => setViewMode('scheduled')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Full"
              isActive={typeFilter === 'full'}
              onClick={() => setTypeFilter('full')}
            />
            <PillButton
              label="Incremental"
              isActive={typeFilter === 'incremental'}
              onClick={() => setTypeFilter('incremental')}
            />
            <PillButton
              label="Snapshot"
              isActive={typeFilter === 'snapshot'}
              onClick={() => setTypeFilter('snapshot')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Backups List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredBackups.map((backup) => (
              <div
                key={backup.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Database className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">{backup.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600">Backup ID: {backup.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                      {backup.type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Storage</p>
                    <div className="flex items-center gap-2">
                      {getStorageIcon(backup.storage)}
                      <span className="text-sm font-medium text-slate-900">
                        {backup.storage}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Size</p>
                    <p className="text-sm font-medium text-slate-900">{backup.size} GB</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {formatDuration(backup.duration)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Files</p>
                    <p className="text-sm font-medium text-slate-900">
                      {backup.filesCount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Last Run</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{backup.lastRun}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Next Run</p>
                    <div className="flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{backup.nextRun}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {backup.encrypted ? (
                      <Shield className="w-4 h-4 text-green-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs text-slate-600">
                      {backup.encrypted ? 'Encrypted' : 'Not Encrypted'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {backup.compressed ? (
                      <FileArchive className="w-4 h-4 text-blue-600" />
                    ) : (
                      <FileArchive className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs text-slate-600">
                      {backup.compressed ? 'Compressed' : 'Uncompressed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {backup.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                    )}
                    <span className="text-xs text-slate-600">
                      {backup.verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Success Rate</span>
                    <span className="text-xs font-medium text-slate-900">{backup.successRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${backup.successRate}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all">
                    Restore
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Details
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Storage Overview */}
            <MiniKPI
              label="Storage Used"
              value={`${totalStorage.toFixed(1)} GB`}
              icon={HardDrive}
              trend={{ value: 15.4, isPositive: true }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Backups"
              activities={[
                {
                  id: '1',
                  title: 'Production DB backup completed',
                  description: '45.6 GB backed up successfully',
                  timestamp: '2 hours ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'User files incremental backup',
                  description: 'In progress - 67% complete',
                  timestamp: '3 hours ago',
                  type: 'info'
                },
                {
                  id: '3',
                  title: 'Log archive failed',
                  description: 'Storage quota exceeded',
                  timestamp: '5 hours ago',
                  type: 'error'
                },
                {
                  id: '4',
                  title: 'Media backup scheduled',
                  description: 'Set to run at 10:00 PM',
                  timestamp: '1 day ago',
                  type: 'info'
                }
              ]}
            />

            {/* Storage by Location */}
            <RankingList
              title="Storage by Location"
              items={[
                { label: 'AWS S3', value: '202.4 GB', rank: 1 },
                { label: 'Google Cloud', value: '98.7 GB', rank: 2 },
                { label: 'Azure', value: '67.3 GB', rank: 3 },
                { label: 'Local', value: '45.2 GB', rank: 4 },
                { label: 'Dropbox', value: '23.7 GB', rank: 5 }
              ]}
            />

            {/* Backup Health */}
            <ProgressCard
              title="Backup Health Score"
              progress={96}
              subtitle="All critical systems protected"
              color="green"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
