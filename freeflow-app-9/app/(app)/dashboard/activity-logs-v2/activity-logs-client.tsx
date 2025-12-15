'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  useActivityLogs,
  getActivityStatusColor,
  getActivityTypeColor,
  getCategoryColor,
  formatActivityTimestamp,
  type ActivityLog
} from '@/lib/hooks/use-activity-logs'

type ViewMode = 'all' | 'success' | 'failed' | 'pending'
type TypeFilter = 'all' | 'create' | 'update' | 'delete' | 'view'

interface ActivityLogsClientProps {
  initialLogs: ActivityLog[]
}

export default function ActivityLogsClient({ initialLogs }: ActivityLogsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const { logs, stats, isLoading } = useActivityLogs(initialLogs, {
    status: viewMode === 'all' ? undefined : viewMode,
    activityType: typeFilter === 'all' ? undefined : typeFilter
  })

  const filteredLogs = logs.filter(log => {
    if (viewMode !== 'all' && log.status !== viewMode) return false
    if (typeFilter !== 'all' && log.activity_type !== typeFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Activity Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track user actions, changes, and system events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
              Export Logs
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Activities',
              value: stats.total.toString(),
              change: '+15%',
              trend: 'up' as const,
              subtitle: 'last 24 hours'
            },
            {
              label: 'Successful',
              value: stats.success.toString(),
              change: '+12%',
              trend: 'up' as const,
              subtitle: 'completed actions'
            },
            {
              label: 'Failed',
              value: stats.failed.toString(),
              change: '-3%',
              trend: 'up' as const,
              subtitle: 'failed actions'
            },
            {
              label: 'Avg Duration',
              value: `${stats.avgDuration.toFixed(0)}ms`,
              change: '+8%',
              trend: 'up' as const,
              subtitle: 'response time'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Search Logs', icon: '🔍', onClick: () => {} },
            { label: 'Export Data', icon: '📥', onClick: () => {} },
            { label: 'User Activity', icon: '👤', onClick: () => {} },
            { label: 'Analytics', icon: '📊', onClick: () => {} },
            { label: 'Audit Trail', icon: '📋', onClick: () => {} },
            { label: 'Alerts', icon: '🔔', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} },
            { label: 'Refresh', icon: '🔄', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity Logs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Activity Logs ({filteredLogs.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No activity logs found matching your filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {log.action}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getActivityStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getActivityTypeColor(log.activity_type)}`}>
                              {log.activity_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <span>{log.user_name || 'Unknown'}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs">{log.user_email}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.activity_code}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </div>

                      {log.resource_type && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 mb-3">
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Resource</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {log.resource_name || log.resource_type}
                            </div>
                            <div className="text-xs text-slate-500">ID: {log.resource_id}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Category</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                              {log.category}
                            </div>
                          </div>
                        </div>
                      )}

                      {log.changes && log.changes.length > 0 && (
                        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Changes</div>
                          <div className="space-y-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{change.field}:</span>{' '}
                                {change.oldValue && (
                                  <>
                                    <span className="text-red-600 dark:text-red-400 line-through">{change.oldValue}</span>
                                    <span className="text-slate-400 mx-1">→</span>
                                  </>
                                )}
                                <span className="text-green-600 dark:text-green-400">{change.newValue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Time</div>
                          <div className="text-sm text-slate-900 dark:text-white">
                            {formatActivityTimestamp(log.created_at)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">IP Address</div>
                          <div className="text-sm font-mono text-slate-900 dark:text-white">
                            {log.ip_address || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Duration</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {log.duration}ms
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all">
                            View Details
                          </button>
                          {log.activity_type === 'update' && (
                            <button className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all">
                              Revert
                            </button>
                          )}
                          <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Success Rate */}
            <MiniKPI
              label="Success Rate"
              value={`${stats.successRate.toFixed(0)}%`}
              trend="up"
              change="+12%"
            />

            {/* Activity Types */}
            <ProgressCard
              title="Activity Types"
              items={[
                { label: 'Creates', value: stats.creates, total: stats.total, color: 'green' },
                { label: 'Updates', value: stats.updates, total: stats.total, color: 'blue' },
                { label: 'Deletes', value: stats.deletes, total: stats.total, color: 'red' },
                { label: 'Other', value: stats.total - stats.creates - stats.updates - stats.deletes, total: stats.total, color: 'gray' }
              ]}
            />

            {/* Top Activities */}
            <RankingList
              title="Top Activity Types"
              items={[
                { label: 'View', value: '35%', rank: 1, trend: 'up' },
                { label: 'Update', value: '28%', rank: 2, trend: 'up' },
                { label: 'Create', value: '18%', rank: 3, trend: 'same' },
                { label: 'Export', value: '12%', rank: 4, trend: 'up' },
                { label: 'Delete', value: '7%', rank: 5, trend: 'down' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Duration"
                value={`${stats.avgDuration.toFixed(0)}ms`}
                trend="down"
                change="-8%"
              />
              <MiniKPI
                label="Pending"
                value={stats.pending.toString()}
                trend="down"
                change="-2"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Blog post created',
                  subject: 'By John Doe',
                  time: '2 minutes ago',
                  type: 'success'
                },
                {
                  action: 'User profile updated',
                  subject: 'By Jane Smith',
                  time: '5 minutes ago',
                  type: 'success'
                },
                {
                  action: 'Settings update failed',
                  subject: 'By Sarah Lee',
                  time: '12 minutes ago',
                  type: 'error'
                },
                {
                  action: 'Data import pending',
                  subject: 'By David Brown',
                  time: '22 minutes ago',
                  type: 'info'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
