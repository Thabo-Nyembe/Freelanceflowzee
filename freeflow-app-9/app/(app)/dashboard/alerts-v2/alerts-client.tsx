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
  HardDrive,
  Plus
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { useAlerts, Alert, getAlertSeverityColor, getAlertStatusColor, getAlertCategoryColor, formatAlertTimestamp } from '@/lib/hooks/use-alerts'
import { acknowledgeAlert, resolveAlert, escalateAlert, snoozeAlert, deleteAlert, acknowledgeAllAlerts } from '@/app/actions/alerts'
import { toast } from 'sonner'

interface AlertsClientProps {
  initialAlerts: Alert[]
}

type AlertStatus = 'all' | 'active' | 'acknowledged' | 'resolved' | 'snoozed' | 'escalated'
type AlertSeverity = 'all' | 'info' | 'warning' | 'error' | 'critical'

export default function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const { alerts, stats, isLoading, error } = useAlerts(initialAlerts)
  const [viewMode, setViewMode] = useState<AlertStatus>('all')
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity>('all')

  const filteredAlerts = alerts.filter(alert => {
    if (viewMode !== 'all' && alert.status !== viewMode) return false
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
    return true
  })

  const handleAcknowledge = async (alertId: string) => {
    const result = await acknowledgeAlert(alertId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Alert acknowledged')
    }
  }

  const handleResolve = async (alertId: string) => {
    const result = await resolveAlert(alertId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Alert resolved')
    }
  }

  const handleEscalate = async (alertId: string) => {
    const result = await escalateAlert(alertId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Alert escalated')
    }
  }

  const handleSnooze = async (alertId: string, minutes: number = 30) => {
    const result = await snoozeAlert(alertId, minutes)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Alert snoozed for ${minutes} minutes`)
    }
  }

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    const result = await deleteAlert(alertId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Alert deleted')
    }
  }

  const handleAcknowledgeAll = async () => {
    if (!confirm('Acknowledge all active alerts?')) return

    const result = await acknowledgeAllAlerts()
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('All alerts acknowledged')
    }
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info': return <Info className="w-5 h-5 text-blue-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error': return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: Alert['category']) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'availability': return <Activity className="w-4 h-4" />
      case 'capacity': return <HardDrive className="w-4 h-4" />
      case 'compliance': return <CheckCircle2 className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const categoryStats = alerts.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalAlerts = Object.values(categoryStats).reduce((sum, count) => sum + count, 0)

  const categoryRanking = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count], index) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: totalAlerts > 0 ? `${Math.round((count / totalAlerts) * 100)}%` : '0%',
      rank: index + 1
    }))

  const recentActivity = alerts.slice(0, 4).map(alert => ({
    id: alert.id,
    title: alert.title,
    description: `${alert.severity} - ${alert.status}`,
    timestamp: formatAlertTimestamp(alert.triggered_at),
    type: alert.severity === 'critical' || alert.severity === 'error' ? 'error' as const :
          alert.severity === 'warning' ? 'warning' as const :
          alert.status === 'resolved' ? 'success' as const : 'info' as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 via-orange-800 to-yellow-900 bg-clip-text text-transparent mb-2">
              Alerts & Notifications
            </h1>
            <p className="text-slate-600">Monitor and manage system alerts and notifications</p>
          </div>
          <button
            onClick={handleAcknowledgeAll}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Acknowledge All
          </button>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Alerts',
              value: stats.total.toString(),
              icon: Bell,
              trend: { value: 12, isPositive: false },
              color: 'red'
            },
            {
              label: 'Active Alerts',
              value: stats.active.toString(),
              icon: AlertCircle,
              trend: { value: 3, isPositive: false },
              color: 'orange'
            },
            {
              label: 'Critical',
              value: stats.critical.toString(),
              icon: AlertTriangle,
              trend: { value: 1, isPositive: false },
              color: 'yellow'
            },
            {
              label: 'Avg Response Time',
              value: `${stats.avgResponseTime.toFixed(0)}m`,
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
              onClick: handleAcknowledgeAll
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
            <PillButton
              label="Escalated"
              isActive={viewMode === 'escalated'}
              onClick={() => setViewMode('escalated')}
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
            {filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No alerts found</h3>
                <p className="text-slate-500">
                  {viewMode !== 'all' || severityFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'All systems running smoothly'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
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
                        <p className="text-xs text-slate-500">Alert ID: {alert.alert_code}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
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
                        <span className="text-sm text-slate-700">{formatAlertTimestamp(alert.triggered_at)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Occurrences</p>
                      <p className="text-sm font-medium text-slate-900">{alert.occurrences}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Response Time</p>
                      <p className="text-sm font-medium text-slate-900">
                        {alert.response_time_minutes > 0 ? `${alert.response_time_minutes}m` : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {alert.affected_systems && alert.affected_systems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2">Affected Systems</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.affected_systems.map((system, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium"
                          >
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.assigned_to && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                      <p className="text-sm font-medium text-slate-900">{alert.assigned_to}</p>
                    </div>
                  )}

                  {alert.impact && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Impact</p>
                      <p className="text-sm text-slate-700">{alert.impact}</p>
                    </div>
                  )}

                  {alert.resolution && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Resolution</p>
                      <p className="text-sm text-green-700">{alert.resolution}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => handleEscalate(alert.id)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                        >
                          Escalate
                        </button>
                        <button
                          onClick={() => handleSnooze(alert.id, 30)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Active Alerts */}
            <MiniKPI
              label="Active Alerts"
              value={stats.active.toString()}
              icon={AlertCircle}
              trend={{ value: 3, isPositive: false }}
              className="bg-gradient-to-br from-red-500 to-orange-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Alert Activity"
              activities={recentActivity}
            />

            {/* Alerts by Category */}
            <RankingList
              title="Alerts by Category"
              items={categoryRanking.length > 0 ? categoryRanking : [{ label: 'No data', value: '0%', rank: 1 }]}
            />

            {/* Response Efficiency */}
            <ProgressCard
              title="Response Efficiency"
              progress={stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}
              subtitle="Alerts resolved"
              color="orange"
            />

            {/* Resolution Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Resolution Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Avg Response</span>
                  <span className="text-sm font-semibold">{stats.avgResponseTime.toFixed(0)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Avg Resolution</span>
                  <span className="text-sm font-semibold">{stats.avgResolutionTime.toFixed(0)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Escalated</span>
                  <span className="text-sm font-semibold">{stats.escalated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Snoozed</span>
                  <span className="text-sm font-semibold">{stats.snoozed}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
