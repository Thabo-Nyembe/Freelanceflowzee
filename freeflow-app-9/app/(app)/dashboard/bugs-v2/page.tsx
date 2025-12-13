"use client"

import { useState } from 'react'
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Target,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Zap,
  Code,
  FileText,
  Activity
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type BugStatus = 'all' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix'
type BugSeverity = 'all' | 'critical' | 'high' | 'medium' | 'low'

export default function BugsV2Page() {
  const [status, setStatus] = useState<BugStatus>('all')
  const [severity, setSeverity] = useState<BugSeverity>('all')

  const stats = [
    {
      label: 'Total Bugs',
      value: '847',
      change: '-18.2%',
      trend: 'down' as const,
      icon: Bug,
      color: 'text-red-600'
    },
    {
      label: 'Open Bugs',
      value: '124',
      change: '-24.7%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      label: 'Resolved',
      value: '684',
      change: '+32.4%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Avg Fix Time',
      value: '2.4d',
      change: '-15.8%',
      trend: 'down' as const,
      icon: Clock,
      color: 'text-blue-600'
    }
  ]

  const quickActions = [
    {
      label: 'Report Bug',
      description: 'Create new bug report',
      icon: Plus,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Triage Bugs',
      description: 'Review and prioritize',
      icon: Target,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Bug Analytics',
      description: 'View bug trends',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Export Report',
      description: 'Download bug data',
      icon: Download,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Code Analysis',
      description: 'Find bug patterns',
      icon: Code,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Auto-Assign',
      description: 'Distribute bugs to team',
      icon: Zap,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Release Notes',
      description: 'Generate changelog',
      icon: FileText,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Hot Fixes',
      description: 'Critical bug dashboard',
      icon: Activity,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const bugs = [
    {
      id: 'BUG-2847',
      title: 'Payment processing fails for international cards',
      description: 'Users with non-US credit cards are unable to complete checkout',
      severity: 'critical',
      status: 'in-progress',
      priority: 'P0',
      assignee: 'Sarah Johnson',
      reporter: 'Michael Chen',
      createdDate: '2024-02-15',
      lastUpdated: '2024-02-15 14:30',
      dueDate: '2024-02-16',
      affectedVersion: 'v3.2.1',
      targetVersion: 'v3.2.2',
      category: 'Backend',
      reproducible: true,
      votes: 47,
      watchers: 12
    },
    {
      id: 'BUG-2846',
      title: 'Dashboard charts display incorrect data',
      description: 'Analytics charts showing cached data instead of real-time updates',
      severity: 'high',
      status: 'open',
      priority: 'P1',
      assignee: 'David Park',
      reporter: 'Emma Wilson',
      createdDate: '2024-02-14',
      lastUpdated: '2024-02-15 12:20',
      dueDate: '2024-02-18',
      affectedVersion: 'v3.2.0',
      targetVersion: 'v3.2.1',
      category: 'Frontend',
      reproducible: true,
      votes: 28,
      watchers: 8
    },
    {
      id: 'BUG-2845',
      title: 'Memory leak in WebSocket connection',
      description: 'Application memory usage increases over time with active WebSocket',
      severity: 'high',
      status: 'in-progress',
      priority: 'P1',
      assignee: 'Robert Taylor',
      reporter: 'Lisa Anderson',
      createdDate: '2024-02-13',
      lastUpdated: '2024-02-15 10:45',
      dueDate: '2024-02-19',
      affectedVersion: 'v3.1.8',
      targetVersion: 'v3.2.2',
      category: 'Backend',
      reproducible: true,
      votes: 34,
      watchers: 15
    },
    {
      id: 'BUG-2844',
      title: 'Mobile app crashes on iOS 17',
      description: 'App crashes when accessing camera on latest iOS version',
      severity: 'critical',
      status: 'resolved',
      priority: 'P0',
      assignee: 'James Martinez',
      reporter: 'Sarah Johnson',
      createdDate: '2024-02-10',
      lastUpdated: '2024-02-14 16:00',
      dueDate: '2024-02-12',
      affectedVersion: 'v3.2.0',
      targetVersion: 'v3.2.1',
      category: 'Mobile',
      reproducible: true,
      votes: 124,
      watchers: 28
    },
    {
      id: 'BUG-2843',
      title: 'Email notifications not being sent',
      description: 'Users not receiving password reset and verification emails',
      severity: 'medium',
      status: 'resolved',
      priority: 'P2',
      assignee: 'Michael Chen',
      reporter: 'David Park',
      createdDate: '2024-02-09',
      lastUpdated: '2024-02-13 14:20',
      dueDate: '2024-02-15',
      affectedVersion: 'v3.1.9',
      targetVersion: 'v3.2.0',
      category: 'Backend',
      reproducible: true,
      votes: 56,
      watchers: 18
    },
    {
      id: 'BUG-2842',
      title: 'Search results pagination broken',
      description: 'Clicking on page 2+ of search results returns empty list',
      severity: 'medium',
      status: 'open',
      priority: 'P2',
      assignee: 'Emma Wilson',
      reporter: 'Robert Taylor',
      createdDate: '2024-02-08',
      lastUpdated: '2024-02-14 11:30',
      dueDate: '2024-02-20',
      affectedVersion: 'v3.2.1',
      targetVersion: 'v3.2.2',
      category: 'Frontend',
      reproducible: true,
      votes: 18,
      watchers: 5
    },
    {
      id: 'BUG-2841',
      title: 'File upload progress bar stuck at 99%',
      description: 'Large file uploads complete but UI shows stuck at 99%',
      severity: 'low',
      status: 'wont-fix',
      priority: 'P3',
      assignee: null,
      reporter: 'Lisa Anderson',
      createdDate: '2024-02-07',
      lastUpdated: '2024-02-12 09:15',
      dueDate: null,
      affectedVersion: 'v3.1.7',
      targetVersion: null,
      category: 'Frontend',
      reproducible: false,
      votes: 8,
      watchers: 2
    },
    {
      id: 'BUG-2840',
      title: 'API rate limit header incorrect',
      description: 'X-RateLimit-Remaining shows negative values',
      severity: 'low',
      status: 'closed',
      priority: 'P3',
      assignee: 'Sarah Johnson',
      reporter: 'James Martinez',
      createdDate: '2024-02-05',
      lastUpdated: '2024-02-11 15:40',
      dueDate: '2024-02-18',
      affectedVersion: 'v3.1.5',
      targetVersion: 'v3.1.8',
      category: 'Backend',
      reproducible: true,
      votes: 12,
      watchers: 4
    },
    {
      id: 'BUG-2839',
      title: 'Dark mode toggle not persisting',
      description: 'User preference for dark mode resets on page refresh',
      severity: 'medium',
      status: 'in-progress',
      priority: 'P2',
      assignee: 'David Park',
      reporter: 'Emma Wilson',
      createdDate: '2024-02-04',
      lastUpdated: '2024-02-15 13:10',
      dueDate: '2024-02-17',
      affectedVersion: 'v3.2.0',
      targetVersion: 'v3.2.1',
      category: 'Frontend',
      reproducible: true,
      votes: 42,
      watchers: 9
    },
    {
      id: 'BUG-2838',
      title: 'Database connection pool exhaustion',
      description: 'Application becomes unresponsive during high traffic',
      severity: 'critical',
      status: 'resolved',
      priority: 'P0',
      assignee: 'Michael Chen',
      reporter: 'Robert Taylor',
      createdDate: '2024-02-02',
      lastUpdated: '2024-02-10 12:00',
      dueDate: '2024-02-05',
      affectedVersion: 'v3.1.9',
      targetVersion: 'v3.2.0',
      category: 'Backend',
      reproducible: true,
      votes: 89,
      watchers: 24
    }
  ]

  const filteredBugs = bugs.filter(bug => {
    const statusMatch = status === 'all' || bug.status === status
    const severityMatch = severity === 'all' || bug.severity === severity
    return statusMatch && severityMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'Open'
        }
      case 'in-progress':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Activity,
          label: 'In Progress'
        }
      case 'resolved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Resolved'
        }
      case 'closed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          label: 'Closed'
        }
      case 'wont-fix':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: XCircle,
          label: "Won't Fix"
        }
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: status
        }
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const recentActivity = [
    { label: 'Bug resolved', time: '30 minutes ago', color: 'text-green-600' },
    { label: 'Critical bug reported', time: '1 hour ago', color: 'text-red-600' },
    { label: 'Bug assigned', time: '2 hours ago', color: 'text-blue-600' },
    { label: 'Bug status updated', time: '3 hours ago', color: 'text-purple-600' },
    { label: 'Fix deployed', time: '5 hours ago', color: 'text-green-600' }
  ]

  const bugsBySeverity = [
    { label: 'Critical', value: '12 bugs', color: 'bg-red-500' },
    { label: 'High', value: '47 bugs', color: 'bg-orange-500' },
    { label: 'Medium', value: '184 bugs', color: 'bg-yellow-500' },
    { label: 'Low', value: '284 bugs', color: 'bg-blue-500' },
    { label: 'Resolved', value: '684 bugs', color: 'bg-green-500' }
  ]

  const resolutionRateData = {
    label: 'Resolution Rate',
    current: 80.8,
    target: 85,
    subtitle: 'This month'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Bug Tracking
            </h1>
            <p className="text-gray-600 mt-2">Track and resolve software defects</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Report Bug
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Bugs
                </PillButton>
                <PillButton
                  onClick={() => setStatus('open')}
                  isActive={status === 'open'}
                  variant="default"
                >
                  Open
                </PillButton>
                <PillButton
                  onClick={() => setStatus('in-progress')}
                  isActive={status === 'in-progress'}
                  variant="default"
                >
                  In Progress
                </PillButton>
                <PillButton
                  onClick={() => setStatus('resolved')}
                  isActive={status === 'resolved'}
                  variant="default"
                >
                  Resolved
                </PillButton>
                <PillButton
                  onClick={() => setStatus('closed')}
                  isActive={status === 'closed'}
                  variant="default"
                >
                  Closed
                </PillButton>
                <PillButton
                  onClick={() => setStatus('wont-fix')}
                  isActive={status === 'wont-fix'}
                  variant="default"
                >
                  Won't Fix
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
                  All Severities
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('critical')}
                  isActive={severity === 'critical'}
                  variant="default"
                >
                  Critical
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('high')}
                  isActive={severity === 'high'}
                  variant="default"
                >
                  High
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('medium')}
                  isActive={severity === 'medium'}
                  variant="default"
                >
                  Medium
                </PillButton>
                <PillButton
                  onClick={() => setSeverity('low')}
                  isActive={severity === 'low'}
                  variant="default"
                >
                  Low
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bugs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bug Reports</h2>
              <div className="text-sm text-gray-600">
                {filteredBugs.length} bugs
              </div>
            </div>

            <div className="space-y-3">
              {filteredBugs.map((bug) => {
                const statusBadge = getStatusBadge(bug.status)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={bug.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-red-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
                          <Bug className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{bug.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{bug.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{bug.priority}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{bug.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getSeverityBadge(bug.severity)}`}>
                          {bug.severity}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{bug.description}</p>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Assignee</div>
                        <div className="font-medium text-gray-900 text-sm">{bug.assignee || 'Unassigned'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Reporter</div>
                        <div className="font-medium text-gray-900 text-sm">{bug.reporter}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Created</div>
                        <div className="font-medium text-gray-900 text-sm">{bug.createdDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Due Date</div>
                        <div className="font-medium text-gray-900 text-sm">{bug.dueDate || 'Not set'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Version: <span className="font-medium text-gray-900">{bug.affectedVersion}</span>
                        </span>
                        {bug.targetVersion && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-600">
                              Fix: <span className="font-medium text-gray-900">{bug.targetVersion}</span>
                            </span>
                          </>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{bug.votes} votes</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{bug.watchers} watchers</span>
                      </div>
                      <div className="text-gray-500">{bug.lastUpdated}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={resolutionRateData.label}
              current={resolutionRateData.current}
              target={resolutionRateData.target}
              subtitle={resolutionRateData.subtitle}
            />

            <MiniKPI
              title="Avg Fix Time"
              value="2.4 days"
              change="-15.8%"
              trend="down"
              subtitle="Time to resolution"
            />

            <RankingList
              title="Bugs by Severity"
              items={bugsBySeverity}
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
