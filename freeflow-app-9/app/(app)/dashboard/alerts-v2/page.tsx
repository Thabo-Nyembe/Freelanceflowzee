'use client'

import { useState } from 'react'
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  TrendingUp,
  Zap,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  Settings,
  Filter,
  BarChart3,
  Clock,
  Users,
  Shield,
  Database,
  Server,
  Cloud,
  Heart,
  Cpu,
  HardDrive
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'snoozed' | 'escalated'
type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'
type AlertCategory = 'performance' | 'security' | 'availability' | 'capacity' | 'compliance' | 'other'
type NotificationChannel = 'email' | 'sms' | 'push' | 'slack' | 'webhook' | 'pagerduty'

interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  category: AlertCategory
  status: AlertStatus
  source: string
  timestamp: string
  affectedSystems: string[]
  assignedTo: string
  notifications: NotificationChannel[]
  occurrences: number
  responseTime: number
  resolution: string
  impact: string
}

export default function AlertsPage() {
  const [viewMode, setViewMode] = useState<'all' | AlertStatus>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all')

  const alerts: Alert[] = [
    {
      id: 'ALT-2847',
      title: 'High CPU Usage Detected',
      description: 'Server cpu-01 experiencing sustained CPU usage above 90% for 15 minutes',
      severity: 'critical',
      category: 'performance',
      status: 'active',
      source: 'Monitoring System',
      timestamp: '2024-01-15 14:30',
      affectedSystems: ['Production Server', 'API Gateway'],
      assignedTo: 'DevOps Team',
      notifications: ['email', 'sms', 'slack', 'pagerduty'],
      occurrences: 3,
      responseTime: 0,
      resolution: '',
      impact: 'Service degradation for 2,847 users'
    },
    {
      id: 'ALT-2848',
      title: 'Unusual Login Activity',
      description: 'Multiple failed login attempts from unknown IP addresses',
      severity: 'warning',
      category: 'security',
      status: 'acknowledged',
      source: 'Security Monitor',
      timestamp: '2024-01-15 13:45',
      affectedSystems: ['Authentication Service', 'User Database'],
      assignedTo: 'Security Team',
      notifications: ['email', 'slack'],
      occurrences: 1,
      responseTime: 15,
      resolution: 'Investigating source IP addresses',
      impact: 'Potential security breach attempt'
    },
    {
      id: 'ALT-2849',
      title: 'Database Connection Pool Exhausted',
      description: 'Connection pool reached maximum capacity, new connections failing',
      severity: 'error',
      category: 'availability',
      status: 'escalated',
      source: 'Database Monitor',
      timestamp: '2024-01-15 12:20',
      affectedSystems: ['Primary Database', 'Application Servers'],
      assignedTo: 'Database Admin',
      notifications: ['email', 'sms', 'pagerduty'],
      occurrences: 2,
      responseTime: 8,
      resolution: 'Scaling connection pool size',
      impact: 'Service interruptions for API requests'
    },
    {
      id: 'ALT-2850',
      title: 'Storage Capacity Warning',
      description: 'Main storage volume reached 85% capacity',
      severity: 'warning',
      category: 'capacity',
      status: 'snoozed',
      source: 'Storage Monitor',
      timestamp: '2024-01-15 10:00',
      affectedSystems: ['Storage Array', 'Backup System'],
      assignedTo: 'Infrastructure Team',
      notifications: ['email', 'slack'],
      occurrences: 1,
      responseTime: 30,
      resolution: 'Scheduled cleanup for next maintenance window',
      impact: 'No immediate impact, planning capacity expansion'
    },
    {
      id: 'ALT-2851',
      title: 'SSL Certificate Expiring Soon',
      description: 'SSL certificate for api.example.com expires in 7 days',
      severity: 'info',
      category: 'compliance',
      status: 'resolved',
      source: 'Certificate Monitor',
      timestamp: '2024-01-14 09:00',
      affectedSystems: ['API Gateway', 'Load Balancer'],
      assignedTo: 'DevOps Team',
      notifications: ['email'],
      occurrences: 1,
      responseTime: 120,
      resolution: 'Certificate renewed successfully',
      impact: 'None - proactive notification'
    },
    {
      id: 'ALT-2852',
      title: 'Backup Job Failed',
      description: 'Nightly backup job for user-data failed to complete',
      severity: 'error',
      category: 'other',
      status: 'active',
      source: 'Backup System',
      timestamp: '2024-01-15 03:30',
      affectedSystems: ['Backup Server', 'Storage'],
      assignedTo: 'Backup Admin',
      notifications: ['email', 'slack'],
      occurrences: 1,
      responseTime: 0,
      resolution: '',
      impact: 'Data protection at risk'
    }
  ]

  const filteredAlerts = alerts.filter(alert => {
    if (viewMode !== 'all' && alert.status !== viewMode) return false
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
    return true
  })

  const totalAlerts = alerts.length
  const activeAlerts = alerts.filter(a => a.status === 'active').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  const avgResponseTime = alerts.reduce((sum, a) => sum + a.responseTime, 0) / alerts.length

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50'
      case 'acknowledged': return 'text-blue-600 bg-blue-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'snoozed': return 'text-gray-600 bg-gray-50'
      case 'escalated': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'info': return <Info className="w-5 h-5 text-blue-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error': return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'availability': return <Activity className="w-4 h-4" />
      case 'capacity': return <HardDrive className="w-4 h-4" />
      case 'compliance': return <CheckCircle2 className="w-4 h-4" />
      case 'other': return <Bell className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 via-orange-800 to-yellow-900 bg-clip-text text-transparent mb-2">
            Alerts & Notifications
          </h1>
          <p className="text-slate-600">Monitor and manage system alerts and notifications</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Alerts',
              value: totalAlerts.toString(),
              icon: Bell,
              trend: { value: 12, isPositive: false },
              color: 'red'
            },
            {
              label: 'Active Alerts',
              value: activeAlerts.toString(),
              icon: AlertCircle,
              trend: { value: 3, isPositive: false },
              color: 'orange'
            },
            {
              label: 'Critical',
              value: criticalAlerts.toString(),
              icon: AlertTriangle,
              trend: { value: 1, isPositive: false },
              color: 'yellow'
            },
            {
              label: 'Avg Response Time',
              value: `${avgResponseTime.toFixed(0)}m`,
              icon: Clock,
              trend: { value: 5, isPositive: true },
              color: 'green'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'Create Alert Rule',
              description: 'Set up monitoring',
              icon: Settings,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Create rule')
            },
            {
              title: 'Acknowledge All',
              description: 'Mark as seen',
              icon: CheckCircle2,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Acknowledge')
            },
            {
              title: 'Notification Settings',
              description: 'Configure channels',
              icon: Mail,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Escalation Rules',
              description: 'Define policies',
              icon: TrendingUp,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Escalation')
            },
            {
              title: 'Alert History',
              description: 'View past alerts',
              icon: BarChart3,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('History')
            },
            {
              title: 'Silence Alerts',
              description: 'Temporary mute',
              icon: Volume2,
              gradient: 'from-gray-500 to-slate-600',
              onClick: () => console.log('Silence')
            },
            {
              title: 'Team On-Call',
              description: 'View rotation',
              icon: Users,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('On-call')
            },
            {
              title: 'Integration Setup',
              description: 'Connect tools',
              icon: Zap,
              gradient: 'from-yellow-500 to-orange-600',
              onClick: () => console.log('Integrations')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Alerts"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Active"
              isActive={viewMode === 'active'}
              onClick={() => setViewMode('active')}
            />
            <PillButton
              label="Acknowledged"
              isActive={viewMode === 'acknowledged'}
              onClick={() => setViewMode('acknowledged')}
            />
            <PillButton
              label="Resolved"
              isActive={viewMode === 'resolved'}
              onClick={() => setViewMode('resolved')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Severity"
              isActive={severityFilter === 'all'}
              onClick={() => setSeverityFilter('all')}
            />
            <PillButton
              label="Critical"
              isActive={severityFilter === 'critical'}
              onClick={() => setSeverityFilter('critical')}
            />
            <PillButton
              label="Error"
              isActive={severityFilter === 'error'}
              onClick={() => setSeverityFilter('error')}
            />
            <PillButton
              label="Warning"
              isActive={severityFilter === 'warning'}
              onClick={() => setSeverityFilter('warning')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{alert.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                      <p className="text-xs text-slate-500">Alert ID: {alert.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(alert.category)}
                      <span className="text-sm font-medium text-slate-900 capitalize">{alert.category}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Source</p>
                    <p className="text-sm font-medium text-slate-900">{alert.source}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{alert.timestamp}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Occurrences</p>
                    <p className="text-sm font-medium text-slate-900">{alert.occurrences}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Response Time</p>
                    <p className="text-sm font-medium text-slate-900">
                      {alert.responseTime > 0 ? `${alert.responseTime}m` : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Affected Systems</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.affectedSystems.map((system, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                  <p className="text-sm font-medium text-slate-900">{alert.assignedTo}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Impact</p>
                  <p className="text-sm text-slate-700">{alert.impact}</p>
                </div>

                {alert.resolution && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">Resolution</p>
                    <p className="text-sm text-green-700">{alert.resolution}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-700 transition-all">
                    {alert.status === 'active' ? 'Acknowledge' : 'View Details'}
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Escalate
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Active Alerts */}
            <MiniKPI
              label="Active Alerts"
              value={activeAlerts.toString()}
              icon={AlertCircle}
              trend={{ value: 3, isPositive: false }}
              className="bg-gradient-to-br from-red-500 to-orange-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Alert Activity"
              activities={[
                {
                  id: '1',
                  title: 'High CPU usage detected',
                  description: 'Production server - Critical',
                  timestamp: '5 minutes ago',
                  type: 'error'
                },
                {
                  id: '2',
                  title: 'Unusual login acknowledged',
                  description: 'Security team investigating',
                  timestamp: '20 minutes ago',
                  type: 'info'
                },
                {
                  id: '3',
                  title: 'Database pool escalated',
                  description: 'Assigned to senior DBA',
                  timestamp: '1 hour ago',
                  type: 'warning'
                },
                {
                  id: '4',
                  title: 'SSL certificate renewed',
                  description: 'Alert resolved successfully',
                  timestamp: '2 hours ago',
                  type: 'success'
                }
              ]}
            />

            {/* Alerts by Category */}
            <RankingList
              title="Alerts by Category"
              items={[
                { label: 'Performance', value: '35%', rank: 1 },
                { label: 'Security', value: '28%', rank: 2 },
                { label: 'Availability', value: '20%', rank: 3 },
                { label: 'Capacity', value: '12%', rank: 4 },
                { label: 'Compliance', value: '5%', rank: 5 }
              ]}
            />

            {/* Response Efficiency */}
            <ProgressCard
              title="Response Efficiency"
              progress={87}
              subtitle="Alerts handled within SLA"
              color="orange"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
