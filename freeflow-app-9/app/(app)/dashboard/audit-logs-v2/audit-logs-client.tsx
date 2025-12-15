'use client'

import { useState } from 'react'
import { useAuditLogs, useAuditAlertRules, AuditLog, AuditAlertRule, getSeverityColor, getStatusColor } from '@/lib/hooks/use-audit-logs'
import {
  FileText,
  Activity,
  User,
  Settings,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  Search,
  Calendar,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut
} from 'lucide-react'

interface AuditLogsClientProps {
  initialLogs: AuditLog[]
  initialRules: AuditAlertRule[]
}

type LogType = 'all' | 'authentication' | 'data' | 'system' | 'security' | 'admin'
type LogSeverity = 'all' | 'info' | 'warning' | 'error' | 'critical'

export default function AuditLogsClient({ initialLogs, initialRules }: AuditLogsClientProps) {
  const [logType, setLogType] = useState<LogType>('all')
  const [severity, setSeverity] = useState<LogSeverity>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { logs, stats, isLoading } = useAuditLogs(initialLogs, {
    logType: logType === 'all' ? undefined : logType,
    severity: severity === 'all' ? undefined : severity
  })
  const { rules } = useAuditAlertRules(initialRules)

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statItems = [
    {
      label: 'Total Events',
      value: stats.total.toLocaleString(),
      change: '+18.2%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Critical Events',
      value: stats.critical.toString(),
      change: '-24.7%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      label: 'User Actions',
      value: stats.authentication.toLocaleString(),
      change: '+12.4%',
      trend: 'up' as const,
      icon: User,
      color: 'text-purple-600'
    },
    {
      label: 'System Events',
      value: stats.system.toLocaleString(),
      change: '+8.7%',
      trend: 'up' as const,
      icon: Settings,
      color: 'text-green-600'
    }
  ]

  const quickActions = [
    { label: 'Export Logs', description: 'Download audit trail', icon: Download, color: 'from-blue-500 to-cyan-500' },
    { label: 'Search Logs', description: 'Advanced log search', icon: Search, color: 'from-purple-500 to-violet-500' },
    { label: 'Filter Events', description: 'Custom log filtering', icon: Filter, color: 'from-green-500 to-emerald-500' },
    { label: 'Security Report', description: 'Generate security audit', icon: Shield, color: 'from-red-500 to-pink-500' },
    { label: 'User Activity', description: 'View user actions', icon: User, color: 'from-orange-500 to-amber-500' },
    { label: 'System Health', description: 'Check system events', icon: Activity, color: 'from-teal-500 to-cyan-500' },
    { label: 'Alert Rules', description: 'Configure log alerts', icon: AlertTriangle, color: 'from-indigo-500 to-purple-500' },
    { label: 'Compliance Export', description: 'Export for compliance', icon: FileText, color: 'from-pink-500 to-rose-500' }
  ]

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'Critical' }
      case 'error':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: XCircle, label: 'Error' }
      case 'warning':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle, label: 'Warning' }
      case 'info':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2, label: 'Info' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Activity, label: sev }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'blocked': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('Login')) return LogIn
    if (action.includes('Logout')) return LogOut
    if (action.includes('Delete')) return Trash2
    if (action.includes('Update') || action.includes('Change')) return Edit
    if (action.includes('Create') || action.includes('New')) return Plus
    if (action.includes('Export')) return Download
    if (action.includes('Security') || action.includes('Unauthorized')) return Shield
    if (action.includes('Lock')) return Lock
    if (action.includes('Unlock')) return Unlock
    return Activity
  }

  const recentActivity = filteredLogs.slice(0, 5).map(log => ({
    label: log.action,
    time: new Date(log.created_at).toLocaleTimeString(),
    color: log.severity === 'critical' ? 'text-red-600' :
           log.severity === 'error' ? 'text-orange-600' :
           log.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
  }))

  const topEventTypes = [
    { label: 'System Events', value: `${(stats.system / 1000).toFixed(1)}K`, color: 'bg-blue-500' },
    { label: 'User Actions', value: `${(stats.authentication / 1000).toFixed(1)}K`, color: 'bg-purple-500' },
    { label: 'Data Changes', value: `${(stats.data / 1000).toFixed(1)}K`, color: 'bg-green-500' },
    { label: 'Authentication', value: `${(stats.authentication / 1000).toFixed(1)}K`, color: 'bg-orange-500' },
    { label: 'Security', value: `${(stats.security / 1000).toFixed(1)}K`, color: 'bg-red-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Audit Logs
            </h1>
            <p className="text-gray-600 mt-2">Monitor and analyze system activity and security events</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{action.label}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'authentication', 'data', 'system', 'security', 'admin'] as LogType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLogType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      logType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'info', 'warning', 'error', 'critical'] as LogSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      severity === sev
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sev === 'all' ? 'All Levels' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Event Log</h2>
              <div className="text-sm text-gray-600">
                {filteredLogs.length} events
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No logs found</div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => {
                  const severityBadge = getSeverityBadge(log.severity)
                  const SeverityIcon = severityBadge.icon
                  const ActionIcon = getActionIcon(log.action)

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-indigo-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            <ActionIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{log.action}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{log.id.substring(0, 8)}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${severityBadge.color}`}>
                            <SeverityIcon className="w-3 h-3" />
                            {severityBadge.label}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{log.description || 'No description'}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">User</div>
                          <div className="font-medium text-gray-900 text-sm">{log.user_email || 'System'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Resource</div>
                          <div className="font-medium text-gray-900 text-sm">{log.resource || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">IP Address</div>
                          <div className="font-medium text-gray-900 text-sm">{log.ip_address || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Location</div>
                          <div className="font-medium text-gray-900 text-sm">{log.location || 'Unknown'}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Type:</span>
                          <span className="text-xs font-medium text-gray-900 uppercase">{log.log_type}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Daily Event Volume</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">events</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${Math.min((stats.total / 30000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{((stats.total / 30000) * 100).toFixed(1)}% of daily capacity</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Critical Events</h3>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-red-600">{stats.critical}</span>
                <div>
                  <span className="text-sm text-green-600 font-medium">-24.7%</span>
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
              <div className="space-y-3">
                {topEventTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{type.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`text-sm ${activity.color}`}>{activity.label}</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
