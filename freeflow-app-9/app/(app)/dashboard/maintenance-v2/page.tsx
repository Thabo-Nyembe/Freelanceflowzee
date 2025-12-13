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
  Cloud
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed'
type MaintenanceType = 'routine' | 'emergency' | 'upgrade' | 'patch' | 'inspection' | 'optimization'
type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
type NotificationMethod = 'email' | 'sms' | 'push' | 'in-app' | 'slack'

interface MaintenanceWindow {
  id: string
  title: string
  type: MaintenanceType
  status: MaintenanceStatus
  impact: ImpactLevel
  startTime: string
  endTime: string
  duration: number
  affectedSystems: string[]
  assignedTo: string[]
  notificationSent: boolean
  notificationMethods: NotificationMethod[]
  usersNotified: number
  downtime: boolean
  description: string
  completionRate: number
}

export default function MaintenancePage() {
  const [viewMode, setViewMode] = useState<'all' | MaintenanceStatus>('all')
  const [impactFilter, setImpactFilter] = useState<'all' | ImpactLevel>('all')

  const maintenanceWindows: MaintenanceWindow[] = [
    {
      id: 'MNT-2847',
      title: 'Database Performance Optimization',
      type: 'optimization',
      status: 'scheduled',
      impact: 'medium',
      startTime: '2024-01-20 02:00',
      endTime: '2024-01-20 06:00',
      duration: 240,
      affectedSystems: ['Database', 'API', 'Analytics'],
      assignedTo: ['John Doe', 'Jane Smith'],
      notificationSent: true,
      notificationMethods: ['email', 'in-app', 'slack'],
      usersNotified: 2847,
      downtime: false,
      description: 'Index optimization and query performance improvements',
      completionRate: 0
    },
    {
      id: 'MNT-2848',
      title: 'Security Patch Deployment',
      type: 'patch',
      status: 'in-progress',
      impact: 'high',
      startTime: '2024-01-15 14:00',
      endTime: '2024-01-15 16:00',
      duration: 120,
      affectedSystems: ['Web Servers', 'Load Balancer', 'CDN'],
      assignedTo: ['Mike Johnson', 'Sarah Lee'],
      notificationSent: true,
      notificationMethods: ['email', 'sms', 'push', 'in-app'],
      usersNotified: 8473,
      downtime: true,
      description: 'Critical security updates for CVE-2024-0001',
      completionRate: 67
    },
    {
      id: 'MNT-2849',
      title: 'Routine Server Health Check',
      type: 'routine',
      status: 'completed',
      impact: 'low',
      startTime: '2024-01-14 01:00',
      endTime: '2024-01-14 02:30',
      duration: 90,
      affectedSystems: ['All Servers'],
      assignedTo: ['Tom Wilson'],
      notificationSent: true,
      notificationMethods: ['email', 'in-app'],
      usersNotified: 1234,
      downtime: false,
      description: 'Weekly health check and system diagnostics',
      completionRate: 100
    },
    {
      id: 'MNT-2850',
      title: 'Emergency Database Failover',
      type: 'emergency',
      status: 'completed',
      impact: 'critical',
      startTime: '2024-01-13 15:30',
      endTime: '2024-01-13 16:15',
      duration: 45,
      affectedSystems: ['Primary Database', 'Cache', 'Sessions'],
      assignedTo: ['Emergency Team'],
      notificationSent: true,
      notificationMethods: ['email', 'sms', 'push', 'in-app', 'slack'],
      usersNotified: 12847,
      downtime: true,
      description: 'Primary database failure - switched to backup',
      completionRate: 100
    },
    {
      id: 'MNT-2851',
      title: 'Platform Upgrade to v3.5',
      type: 'upgrade',
      status: 'scheduled',
      impact: 'high',
      startTime: '2024-01-22 00:00',
      endTime: '2024-01-22 08:00',
      duration: 480,
      affectedSystems: ['Entire Platform'],
      assignedTo: ['DevOps Team', 'Engineering Team'],
      notificationSent: false,
      notificationMethods: ['email', 'push', 'in-app', 'slack'],
      usersNotified: 0,
      downtime: true,
      description: 'Major platform upgrade with new features',
      completionRate: 0
    },
    {
      id: 'MNT-2852',
      title: 'Storage System Inspection',
      type: 'inspection',
      status: 'delayed',
      impact: 'medium',
      startTime: '2024-01-18 03:00',
      endTime: '2024-01-18 05:00',
      duration: 120,
      affectedSystems: ['Storage', 'Backup Systems'],
      assignedTo: ['Infrastructure Team'],
      notificationSent: true,
      notificationMethods: ['email', 'in-app'],
      usersNotified: 456,
      downtime: false,
      description: 'Quarterly storage health inspection',
      completionRate: 0
    }
  ]

  const filteredWindows = maintenanceWindows.filter(window => {
    if (viewMode !== 'all' && window.status !== viewMode) return false
    if (impactFilter !== 'all' && window.impact !== impactFilter) return false
    return true
  })

  const totalWindows = maintenanceWindows.length
  const scheduledWindows = maintenanceWindows.filter(w => w.status === 'scheduled').length
  const completedWindows = maintenanceWindows.filter(w => w.status === 'completed').length
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-8">
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
              value: totalWindows.toString(),
              icon: Calendar,
              trend: { value: 8, isPositive: true },
              color: 'orange'
            },
            {
              label: 'Scheduled',
              value: scheduledWindows.toString(),
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
              value: completedWindows.toString(),
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
              onClick: () => console.log('Schedule')
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
            {filteredWindows.map((window) => (
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
                    <p className="text-xs text-slate-500">Window ID: {window.id}</p>
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
                      <span className="text-sm font-medium text-slate-900">{window.startTime}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">End Time</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{window.endTime}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-sm font-medium text-slate-900">{formatDuration(window.duration)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Users Notified</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {window.usersNotified.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Downtime</p>
                    <div className="flex items-center gap-1">
                      {window.downtime ? (
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
                    {window.affectedSystems.map((system, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Assigned Team</p>
                  <div className="flex flex-wrap gap-2">
                    {window.assignedTo.map((person, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>

                {window.status === 'in-progress' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Completion Progress</span>
                      <span className="text-xs font-medium text-slate-900">{window.completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600"
                        style={{ width: `${window.completionRate}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-700 transition-all">
                    {window.status === 'scheduled' ? 'Start' : 'View Details'}
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Notify Users
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Edit
                  </button>
                </div>
              </div>
            ))}
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
              activities={[
                {
                  id: '1',
                  title: 'Security patch in progress',
                  description: '67% complete - 2 servers remaining',
                  timestamp: '30 minutes ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'Health check completed',
                  description: 'All systems operational',
                  timestamp: '2 hours ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Emergency failover executed',
                  description: 'Switched to backup database',
                  timestamp: '1 day ago',
                  type: 'warning'
                },
                {
                  id: '4',
                  title: 'Upgrade scheduled',
                  description: 'Platform v3.5 on Jan 22',
                  timestamp: '2 days ago',
                  type: 'info'
                }
              ]}
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
              progress={94}
              subtitle="On-time completion rate"
              color="orange"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
