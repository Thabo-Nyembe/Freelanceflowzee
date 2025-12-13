'use client'

import { useState } from 'react'
import {
  Activity,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Settings,
  Edit,
  Trash2,
  FileText,
  Upload,
  Download,
  Mail,
  Bell,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Eye,
  RefreshCw,
  Archive,
  AlertCircle
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ActivityType = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import'
type ActivityCategory = 'user' | 'content' | 'settings' | 'file' | 'api' | 'admin'
type ActivityStatus = 'success' | 'failed' | 'pending'

interface ActivityLog {
  id: string
  timestamp: string
  user: string
  email: string
  type: ActivityType
  category: ActivityCategory
  status: ActivityStatus
  action: string
  resource: string
  resourceId: string
  changes: {
    field: string
    oldValue: string
    newValue: string
  }[]
  ipAddress: string
  userAgent: string
  duration: number
}

export default function ActivityLogsPage() {
  const [viewMode, setViewMode] = useState<'all' | ActivityStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | ActivityType>('all')

  const logs: ActivityLog[] = [
    {
      id: 'ACT-2847',
      timestamp: '2024-01-15 15:30:45',
      user: 'John Doe',
      email: 'john.doe@example.com',
      type: 'create',
      category: 'content',
      status: 'success',
      action: 'Created new blog post',
      resource: 'Blog Post',
      resourceId: 'POST-1234',
      changes: [
        { field: 'title', oldValue: '', newValue: 'Getting Started with React' },
        { field: 'status', oldValue: '', newValue: 'draft' }
      ],
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0',
      duration: 234
    },
    {
      id: 'ACT-2848',
      timestamp: '2024-01-15 15:28:12',
      user: 'Jane Smith',
      email: 'jane.smith@example.com',
      type: 'update',
      category: 'user',
      status: 'success',
      action: 'Updated user profile',
      resource: 'User Profile',
      resourceId: 'USER-5678',
      changes: [
        { field: 'email', oldValue: 'jane.old@example.com', newValue: 'jane.smith@example.com' },
        { field: 'role', oldValue: 'user', newValue: 'admin' }
      ],
      ipAddress: '203.0.113.45',
      userAgent: 'Firefox 121.0',
      duration: 456
    },
    {
      id: 'ACT-2849',
      timestamp: '2024-01-15 15:25:33',
      user: 'Admin User',
      email: 'admin@example.com',
      type: 'delete',
      category: 'file',
      status: 'success',
      action: 'Deleted old backup file',
      resource: 'Backup File',
      resourceId: 'FILE-9012',
      changes: [
        { field: 'status', oldValue: 'active', newValue: 'deleted' }
      ],
      ipAddress: '192.168.1.50',
      userAgent: 'Safari 17.0',
      duration: 123
    },
    {
      id: 'ACT-2850',
      timestamp: '2024-01-15 15:20:18',
      user: 'Mike Johnson',
      email: 'mike.j@example.com',
      type: 'export',
      category: 'api',
      status: 'success',
      action: 'Exported customer data',
      resource: 'Customer Data',
      resourceId: 'EXPORT-3456',
      changes: [],
      ipAddress: '192.168.1.120',
      userAgent: 'Chrome 120.0',
      duration: 2340
    },
    {
      id: 'ACT-2851',
      timestamp: '2024-01-15 15:18:45',
      user: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      type: 'update',
      category: 'settings',
      status: 'failed',
      action: 'Attempted to update security settings',
      resource: 'Security Settings',
      resourceId: 'SETTINGS-7890',
      changes: [
        { field: '2fa', oldValue: 'disabled', newValue: 'enabled' }
      ],
      ipAddress: '192.168.1.75',
      userAgent: 'Chrome 120.0',
      duration: 89
    },
    {
      id: 'ACT-2852',
      timestamp: '2024-01-15 15:15:22',
      user: 'Tom Wilson',
      email: 'tom.w@example.com',
      type: 'login',
      category: 'user',
      status: 'success',
      action: 'Logged in to dashboard',
      resource: 'User Session',
      resourceId: 'SESSION-2468',
      changes: [],
      ipAddress: '192.168.1.95',
      userAgent: 'Edge 120.0',
      duration: 567
    },
    {
      id: 'ACT-2853',
      timestamp: '2024-01-15 15:12:56',
      user: 'Emma Davis',
      email: 'emma.d@example.com',
      type: 'view',
      category: 'content',
      status: 'success',
      action: 'Viewed analytics dashboard',
      resource: 'Dashboard',
      resourceId: 'DASH-1357',
      changes: [],
      ipAddress: '192.168.1.110',
      userAgent: 'Chrome 120.0',
      duration: 1234
    },
    {
      id: 'ACT-2854',
      timestamp: '2024-01-15 15:10:33',
      user: 'David Brown',
      email: 'david.b@example.com',
      type: 'import',
      category: 'file',
      status: 'pending',
      action: 'Importing user data from CSV',
      resource: 'User Import',
      resourceId: 'IMPORT-8024',
      changes: [],
      ipAddress: '192.168.1.85',
      userAgent: 'Firefox 121.0',
      duration: 0
    }
  ]

  const filteredLogs = logs.filter(log => {
    if (viewMode !== 'all' && log.status !== viewMode) return false
    if (typeFilter !== 'all' && log.type !== typeFilter) return false
    return true
  })

  const totalActivities = logs.length
  const successfulActivities = logs.filter(l => l.status === 'success').length
  const failedActivities = logs.filter(l => l.status === 'failed').length
  const avgDuration = logs.reduce((sum, l) => sum + l.duration, 0) / logs.length

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'create': return 'text-green-600 bg-green-50'
      case 'update': return 'text-blue-600 bg-blue-50'
      case 'delete': return 'text-red-600 bg-red-50'
      case 'view': return 'text-purple-600 bg-purple-50'
      case 'login': return 'text-cyan-600 bg-cyan-50'
      case 'logout': return 'text-gray-600 bg-gray-50'
      case 'export': return 'text-orange-600 bg-orange-50'
      case 'import': return 'text-indigo-600 bg-indigo-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'create': return <FileText className="w-4 h-4" />
      case 'update': return <Edit className="w-4 h-4" />
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'view': return <Eye className="w-4 h-4" />
      case 'login': return <User className="w-4 h-4" />
      case 'logout': return <User className="w-4 h-4" />
      case 'export': return <Download className="w-4 h-4" />
      case 'import': return <Upload className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-pink-800 to-rose-900 bg-clip-text text-transparent mb-2">
            Activity Logs
          </h1>
          <p className="text-slate-600">Track user actions, changes, and system events</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Activities',
              value: totalActivities.toString(),
              icon: Activity,
              trend: { value: 15, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Successful',
              value: successfulActivities.toString(),
              icon: CheckCircle2,
              trend: { value: 12, isPositive: true },
              color: 'green'
            },
            {
              label: 'Failed',
              value: failedActivities.toString(),
              icon: XCircle,
              trend: { value: 3, isPositive: false },
              color: 'red'
            },
            {
              label: 'Avg Duration',
              value: `${avgDuration.toFixed(0)}ms`,
              icon: Clock,
              trend: { value: 8, isPositive: true },
              color: 'blue'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'Search Logs',
              description: 'Find activities',
              icon: Search,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Search')
            },
            {
              title: 'Export Logs',
              description: 'Download data',
              icon: Download,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Export')
            },
            {
              title: 'User Activity',
              description: 'By user',
              icon: User,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Users')
            },
            {
              title: 'Analytics',
              description: 'Activity trends',
              icon: BarChart3,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Audit Trail',
              description: 'Compliance logs',
              icon: Archive,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Audit')
            },
            {
              title: 'Alerts',
              description: 'Set notifications',
              icon: Bell,
              gradient: 'from-pink-500 to-rose-600',
              onClick: () => console.log('Alerts')
            },
            {
              title: 'Settings',
              description: 'Configure logs',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Refresh',
              description: 'Update logs',
              icon: RefreshCw,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Refresh')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Activities"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Success"
              isActive={viewMode === 'success'}
              onClick={() => setViewMode('success')}
            />
            <PillButton
              label="Failed"
              isActive={viewMode === 'failed'}
              onClick={() => setViewMode('failed')}
            />
            <PillButton
              label="Pending"
              isActive={viewMode === 'pending'}
              onClick={() => setViewMode('pending')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Create"
              isActive={typeFilter === 'create'}
              onClick={() => setTypeFilter('create')}
            />
            <PillButton
              label="Update"
              isActive={typeFilter === 'update'}
              onClick={() => setTypeFilter('update')}
            />
            <PillButton
              label="Delete"
              isActive={typeFilter === 'delete'}
              onClick={() => setTypeFilter('delete')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Activity Logs List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(log.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{log.action}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-600">{log.user}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{log.email}</span>
                      </div>
                      <p className="text-xs text-slate-500">Activity ID: {log.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Resource</p>
                    <p className="text-sm font-medium text-slate-900">{log.resource}</p>
                    <p className="text-xs text-slate-500">ID: {log.resourceId}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium capitalize">
                      {log.category}
                    </span>
                  </div>
                </div>

                {log.changes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Changes</p>
                    <div className="space-y-2">
                      {log.changes.map((change, idx) => (
                        <div key={idx} className="text-sm bg-slate-50 p-2 rounded">
                          <span className="font-medium text-slate-700">{change.field}:</span>{' '}
                          {change.oldValue && (
                            <>
                              <span className="text-red-600 line-through">{change.oldValue}</span>
                              <span className="text-slate-400 mx-1">→</span>
                            </>
                          )}
                          <span className="text-green-600">{change.newValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{log.timestamp}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">IP Address</p>
                    <span className="text-sm font-mono text-slate-900">{log.ipAddress}</span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <span className="text-sm font-medium text-slate-900">{log.duration}ms</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-700 transition-all">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Revert
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Success Rate */}
            <MiniKPI
              label="Success Rate"
              value={`${((successfulActivities / totalActivities) * 100).toFixed(0)}%`}
              icon={CheckCircle2}
              trend={{ value: 12, isPositive: true }}
              className="bg-gradient-to-br from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Latest Actions"
              activities={[
                {
                  id: '1',
                  title: 'Blog post created',
                  description: 'By John Doe',
                  timestamp: '2 minutes ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'User profile updated',
                  description: 'By Jane Smith',
                  timestamp: '5 minutes ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Settings update failed',
                  description: 'By Sarah Lee',
                  timestamp: '12 minutes ago',
                  type: 'error'
                },
                {
                  id: '4',
                  title: 'Data import pending',
                  description: 'By David Brown',
                  timestamp: '22 minutes ago',
                  type: 'info'
                }
              ]}
            />

            {/* Activity Types */}
            <RankingList
              title="Top Activities"
              items={[
                { label: 'View', value: '35%', rank: 1 },
                { label: 'Update', value: '28%', rank: 2 },
                { label: 'Create', value: '18%', rank: 3 },
                { label: 'Export', value: '12%', rank: 4 },
                { label: 'Delete', value: '7%', rank: 5 }
              ]}
            />

            {/* Activity Health */}
            <ProgressCard
              title="Activity Health"
              progress={89}
              subtitle="System responsiveness"
              color="purple"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
