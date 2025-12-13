"use client"

import { useState } from 'react'
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
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type LogType = 'all' | 'authentication' | 'data' | 'system' | 'security' | 'admin'
type LogSeverity = 'all' | 'info' | 'warning' | 'error' | 'critical'

export default function AuditLogsV2Page() {
  const [logType, setLogType] = useState<LogType>('all')
  const [severity, setSeverity] = useState<LogSeverity>('all')

  const stats = [
    {
      label: 'Total Events',
      value: '284,750',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Critical Events',
      value: '147',
      change: '-24.7%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      label: 'User Actions',
      value: '84,290',
      change: '+12.4%',
      trend: 'up' as const,
      icon: User,
      color: 'text-purple-600'
    },
    {
      label: 'System Events',
      value: '142,847',
      change: '+8.7%',
      trend: 'up' as const,
      icon: Settings,
      color: 'text-green-600'
    }
  ]

  const quickActions = [
    {
      label: 'Export Logs',
      description: 'Download audit trail',
      icon: Download,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Search Logs',
      description: 'Advanced log search',
      icon: Search,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Filter Events',
      description: 'Custom log filtering',
      icon: Filter,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Security Report',
      description: 'Generate security audit',
      icon: Shield,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'User Activity',
      description: 'View user actions',
      icon: User,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'System Health',
      description: 'Check system events',
      icon: Activity,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Alert Rules',
      description: 'Configure log alerts',
      icon: AlertTriangle,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Compliance Export',
      description: 'Export for compliance',
      icon: FileText,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const auditLogs = [
    {
      id: 'LOG-28471',
      timestamp: '2024-02-15 14:32:47',
      type: 'authentication',
      severity: 'info',
      user: 'sarah.johnson@company.com',
      action: 'User Login',
      description: 'Successful login from new device',
      ipAddress: '192.168.1.100',
      location: 'San Francisco, CA',
      device: 'Chrome on MacBook Pro',
      resource: 'Authentication Service',
      status: 'success'
    },
    {
      id: 'LOG-28470',
      timestamp: '2024-02-15 14:28:15',
      type: 'data',
      severity: 'warning',
      user: 'michael.chen@company.com',
      action: 'Data Export',
      description: 'Bulk data export initiated',
      ipAddress: '10.0.0.247',
      location: 'New York, NY',
      device: 'Firefox on Windows',
      resource: 'Customer Database',
      status: 'success'
    },
    {
      id: 'LOG-28469',
      timestamp: '2024-02-15 14:15:22',
      type: 'security',
      severity: 'critical',
      user: 'system@company.com',
      action: 'Failed Login Attempt',
      description: 'Multiple failed login attempts detected',
      ipAddress: '172.16.254.89',
      location: 'Unknown',
      device: 'Unknown',
      resource: 'Authentication Service',
      status: 'blocked'
    },
    {
      id: 'LOG-28468',
      timestamp: '2024-02-15 14:10:05',
      type: 'admin',
      severity: 'warning',
      user: 'david.park@company.com',
      action: 'Permission Change',
      description: 'User role modified to Admin',
      ipAddress: '192.168.1.150',
      location: 'Los Angeles, CA',
      device: 'Safari on MacBook Air',
      resource: 'User Management',
      status: 'success'
    },
    {
      id: 'LOG-28467',
      timestamp: '2024-02-15 14:05:38',
      type: 'system',
      severity: 'error',
      user: 'system@company.com',
      action: 'Database Connection',
      description: 'Database connection pool exhausted',
      ipAddress: '10.0.1.50',
      location: 'Server Room',
      device: 'Database Server',
      resource: 'PostgreSQL Primary',
      status: 'error'
    },
    {
      id: 'LOG-28466',
      timestamp: '2024-02-15 13:58:12',
      type: 'data',
      severity: 'info',
      user: 'emma.wilson@company.com',
      action: 'Record Update',
      description: 'Customer profile updated',
      ipAddress: '192.168.1.125',
      location: 'Seattle, WA',
      device: 'Chrome on Windows',
      resource: 'Customer CRM',
      status: 'success'
    },
    {
      id: 'LOG-28465',
      timestamp: '2024-02-15 13:45:29',
      type: 'authentication',
      severity: 'info',
      user: 'lisa.anderson@company.com',
      action: 'User Logout',
      description: 'User logged out',
      ipAddress: '192.168.1.132',
      location: 'Boston, MA',
      device: 'Edge on Windows',
      resource: 'Authentication Service',
      status: 'success'
    },
    {
      id: 'LOG-28464',
      timestamp: '2024-02-15 13:32:41',
      type: 'admin',
      severity: 'warning',
      user: 'robert.taylor@company.com',
      action: 'User Deletion',
      description: 'User account deactivated',
      ipAddress: '192.168.1.180',
      location: 'Chicago, IL',
      device: 'Chrome on Linux',
      resource: 'User Management',
      status: 'success'
    },
    {
      id: 'LOG-28463',
      timestamp: '2024-02-15 13:20:15',
      type: 'security',
      severity: 'critical',
      user: 'system@company.com',
      action: 'Unauthorized Access',
      description: 'Attempted access to restricted API',
      ipAddress: '203.0.113.47',
      location: 'Unknown',
      device: 'Unknown',
      resource: 'Admin API',
      status: 'blocked'
    },
    {
      id: 'LOG-28462',
      timestamp: '2024-02-15 13:08:52',
      type: 'system',
      severity: 'info',
      user: 'system@company.com',
      action: 'System Backup',
      description: 'Automated backup completed',
      ipAddress: '10.0.1.100',
      location: 'Backup Server',
      device: 'Backup Service',
      resource: 'Backup System',
      status: 'success'
    },
    {
      id: 'LOG-28461',
      timestamp: '2024-02-15 12:55:33',
      type: 'data',
      severity: 'warning',
      user: 'james.martinez@company.com',
      action: 'Bulk Delete',
      description: 'Multiple records deleted',
      ipAddress: '192.168.1.145',
      location: 'Austin, TX',
      device: 'Chrome on MacBook Pro',
      resource: 'Archive Database',
      status: 'success'
    },
    {
      id: 'LOG-28460',
      timestamp: '2024-02-15 12:40:18',
      type: 'authentication',
      severity: 'error',
      user: 'unknown',
      action: 'Failed Login',
      description: 'Invalid credentials',
      ipAddress: '198.51.100.42',
      location: 'Unknown',
      device: 'Unknown',
      resource: 'Authentication Service',
      status: 'failed'
    }
  ]

  const filteredLogs = auditLogs.filter(log => {
    const typeMatch = logType === 'all' || log.type === logType
    const severityMatch = severity === 'all' || log.severity === severity
    return typeMatch && severityMatch
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'Critical'
        }
      case 'error':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: XCircle,
          label: 'Error'
        }
      case 'warning':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Warning'
        }
      case 'info':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle2,
          label: 'Info'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Activity,
          label: severity
        }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const recentActivity = [
    { label: 'Critical security event', time: '5 minutes ago', color: 'text-red-600' },
    { label: 'User login detected', time: '10 minutes ago', color: 'text-blue-600' },
    { label: 'Data export completed', time: '30 minutes ago', color: 'text-green-600' },
    { label: 'System backup finished', time: '1 hour ago', color: 'text-purple-600' },
    { label: 'Failed login attempt', time: '2 hours ago', color: 'text-orange-600' }
  ]

  const topEventTypes = [
    { label: 'System Events', value: '142.8K', color: 'bg-blue-500' },
    { label: 'User Actions', value: '84.3K', color: 'bg-purple-500' },
    { label: 'Data Changes', value: '47.2K', color: 'bg-green-500' },
    { label: 'Authentication', value: '28.4K', color: 'bg-orange-500' },
    { label: 'Security', value: '2.1K', color: 'bg-red-500' }
  ]

  const eventTrendData = {
    label: 'Daily Event Volume',
    current: 28475,
    target: 30000,
    subtitle: '94.9% of daily capacity'
  }

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
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Logs
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setLogType('all')}
                  isActive={logType === 'all'}
                  variant="default"
                >
                  All Events
                </PillButton>
                <PillButton
                  onClick={() => setLogType('authentication')}
                  isActive={logType === 'authentication'}
                  variant="default"
                >
                  Authentication
                </PillButton>
                <PillButton
                  onClick={() => setLogType('data')}
                  isActive={logType === 'data'}
                  variant="default"
                >
                  Data
                </PillButton>
                <PillButton
                  onClick={() => setLogType('system')}
                  isActive={logType === 'system'}
                  variant="default"
                >
                  System
                </PillButton>
                <PillButton
                  onClick={() => setLogType('security')}
                  isActive={logType === 'security'}
                  variant="default"
                >
                  Security
                </PillButton>
                <PillButton
                  onClick={() => setLogType('admin')}
                  isActive={logType === 'admin'}
                  variant="default"
                >
                  Admin
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setSeverity('all')}
                  isActive={severity === 'all'}
                  variant="default"
                >
                  All Levels
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('info')}
                  isActive={severity === 'info'}
                  variant="default"
                >
                  Info
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('warning')}
                  isActive={severity === 'warning'}
                  variant="default"
                >
                  Warning
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('error')}
                  isActive={severity === 'error'}
                  variant="default"
                >
                  Error
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('critical')}
                  isActive={severity === 'critical'}
                  variant="default"
                >
                  Critical
                </PillButton>
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
                            <span className="text-sm text-gray-500">{log.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{log.timestamp}</span>
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

                    <p className="text-sm text-gray-600 mb-4">{log.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">User</div>
                        <div className="font-medium text-gray-900 text-sm">{log.user}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Resource</div>
                        <div className="font-medium text-gray-900 text-sm">{log.resource}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">IP Address</div>
                        <div className="font-medium text-gray-900 text-sm">{log.ipAddress}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="font-medium text-gray-900 text-sm">{log.location}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Type:</span>
                        <span className="text-xs font-medium text-gray-900 uppercase">{log.type}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={eventTrendData.label}
              current={eventTrendData.current}
              target={eventTrendData.target}
              subtitle={eventTrendData.subtitle}
            />

            <MiniKPI
              title="Critical Events"
              value="147"
              change="-24.7%"
              trend="down"
              subtitle="Last 24 hours"
            />

            <RankingList
              title="Event Distribution"
              items={topEventTypes}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
