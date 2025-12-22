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
  useAccessLogs,
  getAccessStatusColor,
  getAccessTypeColor,
  formatAccessTimestamp,
  type AccessLog
} from '@/lib/hooks/use-access-logs'

type ViewMode = 'all' | 'success' | 'failed' | 'blocked' | 'suspicious'
type TypeFilter = 'all' | 'login' | 'api' | 'admin' | 'file-access'

interface AccessLogsClientProps {
  initialLogs: AccessLog[]
}

export default function AccessLogsClient({ initialLogs }: AccessLogsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const { logs, stats, isLoading } = useAccessLogs(initialLogs, {
    status: viewMode === 'all' ? undefined : viewMode,
    accessType: typeFilter === 'all' ? undefined : typeFilter
  })

  const filteredLogs = logs.filter(log => {
    if (viewMode !== 'all' && log.status !== viewMode) return false
    if (typeFilter !== 'all' && log.access_type !== typeFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Access Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor user access, authentication, and system entry points
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
              Export Logs
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Access',
              value: stats.total.toString(),
              change: '+12%',
              trend: 'up' as const,
              subtitle: 'last 24 hours'
            },
            {
              label: 'Successful',
              value: stats.success.toString(),
              change: '+8%',
              trend: 'up' as const,
              subtitle: 'successful access'
            },
            {
              label: 'Failed',
              value: stats.failed.toString(),
              change: '-15%',
              trend: 'up' as const,
              subtitle: 'failed attempts'
            },
            {
              label: 'Blocked',
              value: stats.blocked.toString(),
              change: '+5%',
              trend: 'up' as const,
              subtitle: 'blocked requests'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Search Logs', icon: '🔍', onClick: () => {} },
            { label: 'Export Data', icon: '📥', onClick: () => {} },
            { label: 'Security Alerts', icon: '⚠️', onClick: () => {} },
            { label: 'Analytics', icon: '📊', onClick: () => {} },
            { label: 'IP Whitelist', icon: '🛡️', onClick: () => {} },
            { label: 'Sessions', icon: '👤', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} },
            { label: 'Refresh', icon: '🔄', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <PillButton
              label="All Access"
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
              label="Blocked"
              isActive={viewMode === 'blocked'}
              onClick={() => setViewMode('blocked')}
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Login"
              isActive={typeFilter === 'login'}
              onClick={() => setTypeFilter('login')}
            />
            <PillButton
              label="API"
              isActive={typeFilter === 'api'}
              onClick={() => setTypeFilter('api')}
            />
            <PillButton
              label="Admin"
              isActive={typeFilter === 'admin'}
              onClick={() => setTypeFilter('admin')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Access Logs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Access Logs ({filteredLogs.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No access logs found matching your filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {log.user_name || 'Unknown'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getAccessStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getAccessTypeColor(log.access_type)}`}>
                              {log.access_type}
                            </span>
                            {log.is_suspicious && (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                                ⚠️ Suspicious
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            {log.resource || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.log_code} • {log.user_email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            log.status_code === 200 ? 'text-green-600 dark:text-green-400' :
                            log.status_code >= 400 ? 'text-red-600 dark:text-red-400' :
                            'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {log.status_code}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {log.method}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Time</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatAccessTimestamp(log.created_at)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">IP Address</div>
                          <div className="text-sm font-mono text-slate-900 dark:text-white">
                            {log.ip_address || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Location</div>
                          <div className="text-sm text-slate-900 dark:text-white">
                            {log.location || 'Unknown'}
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="capitalize">{log.device_type}</span>
                            <span>•</span>
                            <span>{log.browser || 'Unknown Browser'}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all">
                              Details
                            </button>
                            <button className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all">
                              Block IP
                            </button>
                          </div>
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
              change="+8%"
            />

            {/* Access Distribution */}
            <ProgressCard
              title="Access Status"
              items={[
                { label: 'Successful', value: stats.success, total: stats.total, color: 'green' },
                { label: 'Failed', value: stats.failed, total: stats.total, color: 'red' },
                { label: 'Blocked', value: stats.blocked, total: stats.total, color: 'orange' },
                { label: 'Suspicious', value: stats.suspicious, total: stats.total, color: 'yellow' }
              ]}
            />

            {/* Top Locations */}
            <RankingList
              title="Top Locations"
              items={[
                { label: 'San Francisco', value: '32%', rank: 1, trend: 'up' },
                { label: 'New York', value: '24%', rank: 2, trend: 'up' },
                { label: 'London', value: '18%', rank: 3, trend: 'same' },
                { label: 'Austin', value: '15%', rank: 4, trend: 'up' },
                { label: 'Seattle', value: '11%', rank: 5, trend: 'down' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Duration"
                value={`${stats.avgDuration.toFixed(0)}ms`}
                trend="down"
                change="-12%"
              />
              <MiniKPI
                label="Suspicious"
                value={stats.suspicious.toString()}
                trend="down"
                change="-5"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Login successful',
                  subject: 'User authenticated from SF',
                  time: '2 minutes ago',
                  type: 'success'
                },
                {
                  action: 'API access',
                  subject: 'Data request from London',
                  time: '5 minutes ago',
                  type: 'success'
                },
                {
                  action: 'Login failed',
                  subject: 'Invalid credentials',
                  time: '12 minutes ago',
                  type: 'error'
                },
                {
                  action: 'Bot blocked',
                  subject: 'Suspicious activity detected',
                  time: '18 minutes ago',
                  type: 'warning'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
