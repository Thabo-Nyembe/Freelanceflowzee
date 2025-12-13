'use client'

import { useState } from 'react'
import {
  Download,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Database,
  File,
  FileSpreadsheet,
  FileCode,
  Archive,
  Calendar,
  Filter,
  BarChart3,
  Zap,
  Mail,
  Cloud,
  HardDrive,
  Users,
  Shield,
  AlertCircle
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ExportStatus = 'completed' | 'in-progress' | 'failed' | 'scheduled' | 'cancelled'
type ExportFormat = 'csv' | 'json' | 'xml' | 'pdf' | 'xlsx' | 'sql'
type ExportType = 'manual' | 'scheduled' | 'automated' | 'api-triggered'
type DataSource = 'users' | 'transactions' | 'analytics' | 'inventory' | 'logs' | 'reports'

interface DataExport {
  id: string
  name: string
  description: string
  status: ExportStatus
  format: ExportFormat
  type: ExportType
  source: DataSource
  records: number
  fileSize: number
  startedAt: string
  completedAt: string
  duration: number
  requestedBy: string
  downloadUrl: string
  expiresAt: string
  encrypted: boolean
  compressed: boolean
}

export default function DataExportPage() {
  const [viewMode, setViewMode] = useState<'all' | ExportStatus>('all')
  const [formatFilter, setFormatFilter] = useState<'all' | ExportFormat>('all')

  const exports: DataExport[] = [
    {
      id: 'EXP-2847',
      name: 'Q4 2023 User Analytics',
      description: 'Complete user engagement metrics for quarterly review',
      status: 'completed',
      format: 'xlsx',
      type: 'manual',
      source: 'analytics',
      records: 284700,
      fileSize: 45.6,
      startedAt: '2024-01-15 14:00',
      completedAt: '2024-01-15 14:12',
      duration: 720,
      requestedBy: 'Jane Smith',
      downloadUrl: '/exports/q4-analytics.xlsx',
      expiresAt: '2024-01-22 14:12',
      encrypted: true,
      compressed: true
    },
    {
      id: 'EXP-2848',
      name: 'Customer Transaction Export',
      description: 'All customer transactions for accounting reconciliation',
      status: 'in-progress',
      format: 'csv',
      type: 'scheduled',
      source: 'transactions',
      records: 156800,
      fileSize: 23.4,
      startedAt: '2024-01-15 15:30',
      completedAt: '',
      duration: 0,
      requestedBy: 'Finance Team',
      downloadUrl: '',
      expiresAt: '2024-01-22 15:30',
      encrypted: true,
      compressed: false
    },
    {
      id: 'EXP-2849',
      name: 'User Database Backup',
      description: 'Complete user database snapshot for disaster recovery',
      status: 'completed',
      format: 'sql',
      type: 'automated',
      source: 'users',
      records: 847000,
      fileSize: 234.8,
      startedAt: '2024-01-15 03:00',
      completedAt: '2024-01-15 04:15',
      duration: 4500,
      requestedBy: 'System',
      downloadUrl: '/exports/user-db-backup.sql',
      expiresAt: '2024-01-30 04:15',
      encrypted: true,
      compressed: true
    },
    {
      id: 'EXP-2850',
      name: 'Monthly Inventory Report',
      description: 'Inventory levels and movement summary for January',
      status: 'scheduled',
      format: 'pdf',
      type: 'scheduled',
      source: 'inventory',
      records: 12400,
      fileSize: 0,
      startedAt: '2024-02-01 09:00',
      completedAt: '',
      duration: 0,
      requestedBy: 'Warehouse Manager',
      downloadUrl: '',
      expiresAt: '2024-02-08 09:00',
      encrypted: false,
      compressed: false
    },
    {
      id: 'EXP-2851',
      name: 'API Activity Logs',
      description: 'API request and response logs for debugging',
      status: 'failed',
      format: 'json',
      type: 'api-triggered',
      source: 'logs',
      records: 567800,
      fileSize: 0,
      startedAt: '2024-01-15 12:00',
      completedAt: '',
      duration: 0,
      requestedBy: 'DevOps Team',
      downloadUrl: '',
      expiresAt: '2024-01-22 12:00',
      encrypted: true,
      compressed: true
    },
    {
      id: 'EXP-2852',
      name: 'Sales Performance Data',
      description: 'Weekly sales metrics and performance indicators',
      status: 'completed',
      format: 'xlsx',
      type: 'scheduled',
      source: 'reports',
      records: 4560,
      fileSize: 8.9,
      startedAt: '2024-01-15 08:00',
      completedAt: '2024-01-15 08:05',
      duration: 300,
      requestedBy: 'Sales Director',
      downloadUrl: '/exports/weekly-sales.xlsx',
      expiresAt: '2024-01-22 08:05',
      encrypted: false,
      compressed: true
    }
  ]

  const filteredExports = exports.filter(exp => {
    if (viewMode !== 'all' && exp.status !== viewMode) return false
    if (formatFilter !== 'all' && exp.format !== formatFilter) return false
    return true
  })

  const totalExports = exports.length
  const completedExports = exports.filter(e => e.status === 'completed').length
  const totalRecords = exports.reduce((sum, e) => sum + e.records, 0)
  const totalSize = exports.reduce((sum, e) => sum + e.fileSize, 0)

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'scheduled': return 'text-purple-600 bg-purple-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getFormatColor = (format: ExportFormat) => {
    switch (format) {
      case 'csv': return 'text-green-600 bg-green-50'
      case 'json': return 'text-yellow-600 bg-yellow-50'
      case 'xml': return 'text-orange-600 bg-orange-50'
      case 'pdf': return 'text-red-600 bg-red-50'
      case 'xlsx': return 'text-blue-600 bg-blue-50'
      case 'sql': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />
      case 'json': return <FileCode className="w-4 h-4" />
      case 'xml': return <FileCode className="w-4 h-4" />
      case 'pdf': return <FileText className="w-4 h-4" />
      case 'xlsx': return <FileSpreadsheet className="w-4 h-4" />
      case 'sql': return <Database className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900 bg-clip-text text-transparent mb-2">
            Data Export
          </h1>
          <p className="text-slate-600">Export and download data in various formats</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Exports',
              value: totalExports.toString(),
              icon: Download,
              trend: { value: 18, isPositive: true },
              color: 'green'
            },
            {
              label: 'Completed',
              value: completedExports.toString(),
              icon: CheckCircle2,
              trend: { value: 12, isPositive: true },
              color: 'emerald'
            },
            {
              label: 'Total Records',
              value: totalRecords.toLocaleString(),
              icon: Database,
              trend: { value: 25, isPositive: true },
              color: 'teal'
            },
            {
              label: 'Total Size',
              value: `${totalSize.toFixed(1)} GB`,
              icon: HardDrive,
              trend: { value: 15, isPositive: true },
              color: 'cyan'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Export',
              description: 'Create export job',
              icon: Download,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('New export')
            },
            {
              title: 'Schedule Export',
              description: 'Automate exports',
              icon: Calendar,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Schedule')
            },
            {
              title: 'Templates',
              description: 'Saved configs',
              icon: FileText,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Templates')
            },
            {
              title: 'Download History',
              description: 'View past exports',
              icon: Archive,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('History')
            },
            {
              title: 'API Access',
              description: 'Export via API',
              icon: Zap,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('API')
            },
            {
              title: 'Email Reports',
              description: 'Send exports',
              icon: Mail,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Email')
            },
            {
              title: 'Cloud Storage',
              description: 'Upload to cloud',
              icon: Cloud,
              gradient: 'from-teal-500 to-cyan-600',
              onClick: () => console.log('Cloud')
            },
            {
              title: 'Settings',
              description: 'Configure exports',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Exports"
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
              label="Scheduled"
              isActive={viewMode === 'scheduled'}
              onClick={() => setViewMode('scheduled')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Formats"
              isActive={formatFilter === 'all'}
              onClick={() => setFormatFilter('all')}
            />
            <PillButton
              label="CSV"
              isActive={formatFilter === 'csv'}
              onClick={() => setFormatFilter('csv')}
            />
            <PillButton
              label="XLSX"
              isActive={formatFilter === 'xlsx'}
              onClick={() => setFormatFilter('xlsx')}
            />
            <PillButton
              label="JSON"
              isActive={formatFilter === 'json'}
              onClick={() => setFormatFilter('json')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Exports List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredExports.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">{exp.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{exp.description}</p>
                    <p className="text-xs text-slate-500">Export ID: {exp.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exp.status)}`}>
                      {exp.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFormatColor(exp.format)}`}>
                      {exp.format.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Format</p>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(exp.format)}
                      <span className="text-sm font-medium text-slate-900 uppercase">{exp.format}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Records</p>
                    <p className="text-sm font-medium text-slate-900">{exp.records.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">File Size</p>
                    <p className="text-sm font-medium text-slate-900">
                      {exp.fileSize > 0 ? `${exp.fileSize} GB` : 'Pending'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-sm font-medium text-slate-900">{formatDuration(exp.duration)}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Started At</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{exp.startedAt}</span>
                    </div>
                  </div>

                  {exp.completedAt && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Completed At</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-sm text-slate-700">{exp.completedAt}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Requested By</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{exp.requestedBy}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Source</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{exp.source}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Type</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {exp.type.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {exp.encrypted ? (
                      <>
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-slate-600">Encrypted</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-slate-600">Not Encrypted</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {exp.compressed ? (
                      <>
                        <Archive className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-slate-600">Compressed</span>
                      </>
                    ) : (
                      <>
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-slate-600">Uncompressed</span>
                      </>
                    )}
                  </div>

                  {exp.status === 'completed' && (
                    <div>
                      <p className="text-xs text-slate-500">Expires: {exp.expiresAt}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                    disabled={exp.status !== 'completed'}
                  >
                    {exp.status === 'completed' ? 'Download' : exp.status}
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Details
                  </button>
                  {exp.status === 'completed' && (
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                      Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Completed Exports */}
            <MiniKPI
              label="Completed Exports"
              value={completedExports.toString()}
              icon={CheckCircle2}
              trend={{ value: 12, isPositive: true }}
              className="bg-gradient-to-br from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Exports"
              activities={[
                {
                  id: '1',
                  title: 'Q4 analytics completed',
                  description: '284,700 records exported',
                  timestamp: '1 hour ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'Transaction export in progress',
                  description: '67% complete',
                  timestamp: '30 minutes ago',
                  type: 'info'
                },
                {
                  id: '3',
                  title: 'User database backup done',
                  description: '847,000 records - 234.8 GB',
                  timestamp: '12 hours ago',
                  type: 'success'
                },
                {
                  id: '4',
                  title: 'API logs export failed',
                  description: 'Timeout error',
                  timestamp: '3 hours ago',
                  type: 'error'
                }
              ]}
            />

            {/* Export Formats */}
            <RankingList
              title="Popular Formats"
              items={[
                { label: 'XLSX', value: '35%', rank: 1 },
                { label: 'CSV', value: '28%', rank: 2 },
                { label: 'JSON', value: '18%', rank: 3 },
                { label: 'SQL', value: '12%', rank: 4 },
                { label: 'PDF', value: '7%', rank: 5 }
              ]}
            />

            {/* Success Rate */}
            <ProgressCard
              title="Export Success Rate"
              progress={92}
              subtitle="Last 30 days"
              color="green"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
