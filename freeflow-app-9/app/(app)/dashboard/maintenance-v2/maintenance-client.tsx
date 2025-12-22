'use client'

import { useState } from 'react'
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Server,
  Activity,
  Calendar,
  Settings,
  AlertTriangle,
  TrendingUp,
  Zap,
  BarChart3,
  Bell,
  Pause,
  Play,
  Info,
  Users,
  Mail,
  MessageSquare,
  Shield,
  Database,
  HardDrive,
  Cpu,
  Cloud,
  RotateCw,
  Plus,
  Trash2
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { useMaintenance, MaintenanceWindow, MaintenanceStats } from '@/lib/hooks/use-maintenance'

type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed'
type MaintenanceType = 'routine' | 'emergency' | 'upgrade' | 'patch' | 'inspection' | 'optimization'
type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'

interface MaintenanceClientProps {
  initialWindows: MaintenanceWindow[]
  initialStats: MaintenanceStats
}

export default function MaintenanceClient({ initialWindows, initialStats }: MaintenanceClientProps) {
  const [viewMode, setViewMode] = useState<'all' | MaintenanceStatus>('all')
  const [impactFilter, setImpactFilter] = useState<'all' | ImpactLevel>('all')

  const {
    windows,
    loading,
    createWindow,
    updateWindow,
    deleteWindow,
    startMaintenance,
    completeMaintenance,
    cancelMaintenance,
    sendNotifications,
    getStats
  } = useMaintenance()

  // Use real-time data if available, otherwise use initial data
  const displayWindows = windows.length > 0 ? windows : initialWindows
  const stats = windows.length > 0 ? getStats() : initialStats

  const filteredWindows = displayWindows.filter(window => {
    if (viewMode !== 'all' && window.status !== viewMode) return false
    if (impactFilter !== 'all' && window.impact !== impactFilter) return false
    return true
  })

  const systemUptime = 99.8

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50'
      case 'in-progress': return 'text-orange-600 bg-orange-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      case 'delayed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case 'routine': return <Clock className="w-4 h-4" />
      case 'emergency': return <AlertTriangle className="w-4 h-4" />
      case 'upgrade': return <TrendingUp className="w-4 h-4" />
      case 'patch': return <Shield className="w-4 h-4" />
      case 'inspection': return <Activity className="w-4 h-4" />
      case 'optimization': return <Zap className="w-4 h-4" />
      default: return <Wrench className="w-4 h-4" />
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    } else {
      return `${mins}m`
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const handleCreateWindow = async () => {
    const startTime = new Date()
    startTime.setHours(startTime.getHours() + 24)
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 2)

    await createWindow({
      title: 'New Maintenance Window',
      description: 'Scheduled maintenance',
      type: 'routine',
      impact: 'low',
      priority: 'medium',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-900 via-red-800 to-pink-900 bg-clip-text text-transparent mb-2">
            Maintenance Windows
          </h1>
          <p className="text-slate-600">Schedule and manage system maintenance operations</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Windows',
              value: stats.total.toString(),
              icon: Calendar,
              trend: { value: 8, isPositive: true },
              color: 'orange'
            },
            {
              label: 'Scheduled',
              value: stats.scheduled.toString(),
              icon: Clock,
              trend: { value: 2, isPositive: true },
              color: 'blue'
            },
            {
              label: 'System Uptime',
              value: `${systemUptime}%`,
              icon: Activity,
              trend: { value: 0.2, isPositive: true },
              color: 'green'
            },
            {
              label: 'Completed',
              value: stats.completed.toString(),
              icon: CheckCircle2,
              trend: { value: 15, isPositive: true },
              color: 'purple'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'Schedule Window',
              description: 'Plan maintenance',
              icon: Calendar,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: handleCreateWindow
            },
            {
              title: 'Emergency Mode',
              description: 'Activate immediately',
              icon: AlertTriangle,
              gradient: 'from-red-500 to-rose-600',
              onClick: () => console.log('Emergency')
            },
            {
              title: 'Send Notifications',
              description: 'Alert users',
              icon: Bell,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Notify')
            },
            {
              title: 'System Status',
              description: 'View health',
              icon: Activity,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Status')
            },
            {
              title: 'Maintenance Log',
              description: 'View history',
              icon: BarChart3,
              gradient: 'from-orange-500 to-amber-600',
              onClick: () => console.log('Log')
            },
            {
              title: 'Team Calendar',
              description: 'View schedule',
              icon: Users,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Calendar')
            },
            {
              title: 'Settings',
              description: 'Configure alerts',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Runbooks',
              description: 'View procedures',
              icon: Info,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Runbooks')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Windows"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Scheduled"
              isActive={viewMode === 'scheduled'}
              onClick={() => setViewMode('scheduled')}
            />
            <PillButton
              label="In Progress"
              isActive={viewMode === 'in-progress'}
              onClick={() => setViewMode('in-progress')}
            />
            <PillButton
              label="Completed"
              isActive={viewMode === 'completed'}
              onClick={() => setViewMode('completed')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Impact"
              isActive={impactFilter === 'all'}
              onClick={() => setImpactFilter('all')}
            />
            <PillButton
              label="Low"
              isActive={impactFilter === 'low'}
              onClick={() => setImpactFilter('low')}
            />
            <PillButton
              label="Medium"
              isActive={impactFilter === 'medium'}
              onClick={() => setImpactFilter('medium')}
            />
            <PillButton
              label="High"
              isActive={impactFilter === 'high'}
              onClick={() => setImpactFilter('high')}
            />
            <PillButton
              label="Critical"
              isActive={impactFilter === 'critical'}
              onClick={() => setImpactFilter('critical')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Maintenance Windows List */}
          <div className="lg:col-span-2 space-y-4">
            {loading && displayWindows.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <RotateCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-4" />
                <p className="text-slate-600">Loading maintenance windows...</p>
              </div>
            ) : filteredWindows.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No maintenance windows found</h3>
                <p className="text-slate-600 mb-4">Schedule your first maintenance window</p>
                <button
                  onClick={handleCreateWindow}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Schedule Window
                </button>
              </div>
            ) : (
              filteredWindows.map((window) => (
                <div
                  key={window.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(window.type)}
                        <h3 className="font-semibold text-slate-900">{window.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{window.description}</p>
                      <p className="text-xs text-slate-500">Window ID: {window.window_code || window.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(window.status)}`}>
                        {window.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(window.impact)}`}>
                        {window.impact}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Start Time</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{formatDate(window.start_time)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">End Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{formatDate(window.end_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Duration</p>
                      <p className="text-sm font-medium text-slate-900">{formatDuration(window.duration_minutes)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Users Notified</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {window.users_notified.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Downtime</p>
                      <div className="flex items-center gap-1">
                        {window.downtime_expected ? (
                          <>
                            <Pause className="w-3 h-3 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Expected</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-medium text-green-600">None</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Affected Systems</p>
                    <div className="flex flex-wrap gap-2">
                      {window.affected_systems.map((system, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                        >
                          {system}
                        </span>
                      ))}
                      {window.affected_systems.length === 0 && (
                        <span className="text-xs text-slate-400">No systems specified</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Assigned Team</p>
                    <div className="flex flex-wrap gap-2">
                      {window.assigned_to.map((person, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {person}
                        </span>
                      ))}
                      {window.assigned_to.length === 0 && (
                        <span className="text-xs text-slate-400">No team assigned</span>
                      )}
                    </div>
                  </div>

                  {window.status === 'in-progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Completion Progress</span>
                        <span className="text-xs font-medium text-slate-900">{window.completion_rate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600"
                          style={{ width: `${window.completion_rate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    {window.status === 'scheduled' && (
                      <button
                        onClick={() => startMaintenance(window.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    )}
                    {window.status === 'in-progress' && (
                      <button
                        onClick={() => completeMaintenance(window.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </button>
                    )}
                    {window.status === 'completed' && (
                      <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                        View Details
                      </button>
                    )}
                    {!window.notification_sent && window.status === 'scheduled' && (
                      <button
                        onClick={() => sendNotifications(window.id)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all flex items-center gap-1"
                      >
                        <Bell className="w-4 h-4" />
                        Notify
                      </button>
                    )}
                    {(window.status === 'scheduled' || window.status === 'in-progress') && (
                      <button
                        onClick={() => cancelMaintenance(window.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => deleteWindow(window.id)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* System Uptime */}
            <MiniKPI
              label="System Uptime"
              value={`${systemUptime}%`}
              icon={Activity}
              trend={{ value: 0.2, isPositive: true }}
              className="bg-gradient-to-br from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Events"
              activities={displayWindows.slice(0, 4).map((window) => ({
                id: window.id,
                title: window.title,
                description: window.status === 'completed'
                  ? 'Maintenance completed'
                  : window.status === 'in-progress'
                    ? `${window.completion_rate}% complete`
                    : window.status === 'scheduled'
                      ? `Scheduled for ${formatDate(window.start_time)}`
                      : window.status,
                timestamp: formatDate(window.actual_start || window.start_time),
                type: window.status === 'completed' ? 'success'
                  : window.status === 'in-progress' ? 'info'
                    : window.impact === 'critical' ? 'warning'
                      : 'info'
              }))}
            />

            {/* System Health */}
            <RankingList
              title="System Health"
              items={[
                { label: 'Web Servers', value: '100%', rank: 1 },
                { label: 'Database', value: '99.9%', rank: 2 },
                { label: 'Cache', value: '99.7%', rank: 3 },
                { label: 'Storage', value: '98.5%', rank: 4 },
                { label: 'CDN', value: '97.8%', rank: 5 }
              ]}
            />

            {/* Maintenance Score */}
            <ProgressCard
              title="Maintenance Efficiency"
              progress={Math.round(stats.avgCompletionRate)}
              subtitle="On-time completion rate"
              color="orange"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
