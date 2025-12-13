'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type DependencyStatus = 'active' | 'resolved' | 'blocked' | 'cancelled'
type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
type ImpactLevel = 'critical' | 'high' | 'medium' | 'low'
type ViewMode = 'all' | 'active' | 'blocked' | 'resolved'

export default function DependenciesV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample dependencies data
  const dependencies = [
    {
      id: 'DEP-2847',
      name: 'API Integration depends on Authentication',
      predecessor: 'User Authentication System',
      successor: 'Third-Party API Integration',
      type: 'finish-to-start' as const,
      status: 'active' as const,
      impactLevel: 'critical' as const,
      owner: 'Emily Rodriguez',
      team: 'Engineering',
      createdDate: '2024-02-01',
      dueDate: '2024-02-28',
      daysRemaining: 14,
      blockedDays: 0,
      resolution: '',
      predecessorProgress: 87,
      successorProgress: 42
    },
    {
      id: 'DEP-2846',
      name: 'Mobile UI depends on Design System',
      predecessor: 'Component Design System',
      successor: 'Mobile App UI Implementation',
      type: 'finish-to-start' as const,
      status: 'blocked' as const,
      impactLevel: 'high' as const,
      owner: 'Michael Chen',
      team: 'Mobile Team',
      createdDate: '2024-01-28',
      dueDate: '2024-02-25',
      daysRemaining: 11,
      blockedDays: 5,
      resolution: 'Design team reviewing final components',
      predecessorProgress: 92,
      successorProgress: 24
    },
    {
      id: 'DEP-2845',
      name: 'Testing depends on Feature Complete',
      predecessor: 'Feature Development',
      successor: 'QA Testing Phase',
      type: 'finish-to-start' as const,
      status: 'resolved' as const,
      impactLevel: 'critical' as const,
      owner: 'Sarah Johnson',
      team: 'QA Team',
      createdDate: '2024-01-15',
      dueDate: '2024-02-10',
      daysRemaining: 0,
      blockedDays: 0,
      resolution: 'Feature completed on schedule',
      predecessorProgress: 100,
      successorProgress: 68
    },
    {
      id: 'DEP-2844',
      name: 'Deployment depends on Infrastructure',
      predecessor: 'Infrastructure Setup',
      successor: 'Production Deployment',
      type: 'finish-to-start' as const,
      status: 'active' as const,
      impactLevel: 'critical' as const,
      owner: 'David Kim',
      team: 'DevOps',
      createdDate: '2024-02-05',
      dueDate: '2024-03-01',
      daysRemaining: 16,
      blockedDays: 0,
      resolution: '',
      predecessorProgress: 74,
      successorProgress: 12
    },
    {
      id: 'DEP-2843',
      name: 'Documentation depends on API Finalization',
      predecessor: 'API Development',
      successor: 'API Documentation',
      type: 'finish-to-finish' as const,
      status: 'active' as const,
      impactLevel: 'medium' as const,
      owner: 'Jessica Williams',
      team: 'Product Team',
      createdDate: '2024-02-08',
      dueDate: '2024-02-22',
      daysRemaining: 8,
      blockedDays: 0,
      resolution: '',
      predecessorProgress: 88,
      successorProgress: 76
    },
    {
      id: 'DEP-2842',
      name: 'Marketing Launch depends on Product',
      predecessor: 'Product Launch',
      successor: 'Marketing Campaign',
      type: 'start-to-start' as const,
      status: 'blocked' as const,
      impactLevel: 'high' as const,
      owner: 'Lisa Anderson',
      team: 'Marketing',
      createdDate: '2024-01-20',
      dueDate: '2024-03-15',
      daysRemaining: 30,
      blockedDays: 12,
      resolution: 'Waiting for product release date confirmation',
      predecessorProgress: 62,
      successorProgress: 34
    }
  ]

  const criticalPath = [
    {
      id: 'CP-8471',
      task: 'User Authentication System',
      duration: 14,
      progress: 87,
      status: 'in-progress' as const
    },
    {
      id: 'CP-8470',
      task: 'Third-Party API Integration',
      duration: 21,
      progress: 42,
      status: 'waiting' as const
    },
    {
      id: 'CP-8469',
      task: 'Infrastructure Setup',
      duration: 28,
      progress: 74,
      status: 'in-progress' as const
    },
    {
      id: 'CP-8468',
      task: 'Production Deployment',
      duration: 7,
      progress: 12,
      status: 'waiting' as const
    }
  ]

  const getStatusColor = (status: DependencyStatus) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'blocked': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'cancelled': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getTypeColor = (type: DependencyType) => {
    switch (type) {
      case 'finish-to-start': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'start-to-start': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'finish-to-finish': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'start-to-finish': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  }

  const getImpactLevelColor = (level: ImpactLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getTaskStatusColor = (status: 'in-progress' | 'waiting' | 'completed') => {
    switch (status) {
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'waiting': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  }

  const filteredDependencies = viewMode === 'all'
    ? dependencies
    : dependencies.filter(dep => dep.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Project Dependencies
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage task dependencies and critical path
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300">
              Add Dependency
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Dependencies',
              value: '47',
              change: '+8',
              trend: 'up' as const,
              subtitle: 'across all projects'
            },
            {
              label: 'Blocked Tasks',
              value: '12',
              change: '-3',
              trend: 'up' as const,
              subtitle: 'require resolution'
            },
            {
              label: 'Critical Path',
              value: '42 days',
              change: '-5 days',
              trend: 'up' as const,
              subtitle: 'project timeline'
            },
            {
              label: 'Resolution Rate',
              value: '89%',
              change: '+6%',
              trend: 'up' as const,
              subtitle: 'on-time resolution'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Add Dependency', icon: '🔗', onClick: () => {} },
            { label: 'Critical Path', icon: '🛤️', onClick: () => {} },
            { label: 'Dependency Map', icon: '🗺️', onClick: () => {} },
            { label: 'Blocked Tasks', icon: '🚫', onClick: () => {} },
            { label: 'Timeline View', icon: '📅', onClick: () => {} },
            { label: 'Impact Analysis', icon: '📊', onClick: () => {} },
            { label: 'Reports', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Dependencies"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Blocked"
            isActive={viewMode === 'blocked'}
            onClick={() => setViewMode('blocked')}
          />
          <PillButton
            label="Resolved"
            isActive={viewMode === 'resolved'}
            onClick={() => setViewMode('resolved')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Dependencies List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Dependencies ({filteredDependencies.length})
              </h2>
              <div className="space-y-3">
                {filteredDependencies.map((dependency) => (
                  <div
                    key={dependency.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {dependency.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(dependency.status)}`}>
                            {dependency.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getImpactLevelColor(dependency.impactLevel)}`}>
                            {dependency.impactLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-indigo-500">👤</span>
                            {dependency.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-indigo-500">👥</span>
                            {dependency.team}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(dependency.type)}`}>
                            {dependency.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 mb-3">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Predecessor</div>
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {dependency.predecessor}
                        </div>
                        <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            style={{ width: `${dependency.predecessorProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {dependency.predecessorProgress}% complete
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Successor</div>
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {dependency.successor}
                        </div>
                        <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                            style={{ width: `${dependency.successorProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {dependency.successorProgress}% complete
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Due: {dependency.dueDate}</span>
                        {dependency.daysRemaining > 0 ? (
                          <span className={dependency.daysRemaining <= 7 ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                            {dependency.daysRemaining} days remaining
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-bold">Resolved</span>
                        )}
                        {dependency.blockedDays > 0 && (
                          <span className="text-red-600 dark:text-red-400 font-bold">
                            Blocked {dependency.blockedDays} days
                          </span>
                        )}
                      </div>
                      {dependency.resolution && (
                        <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                          {dependency.resolution}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Critical Path */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Critical Path</h3>
              <div className="space-y-3">
                {criticalPath.map((task, index) => (
                  <div key={task.id}>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                            {task.task}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>{task.duration} days</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    {index < criticalPath.length - 1 && (
                      <div className="flex justify-center py-1">
                        <span className="text-indigo-500">↓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dependency Status */}
            <ProgressCard
              title="Dependency Status"
              items={[
                { label: 'Active', value: 24, total: 47, color: 'blue' },
                { label: 'Resolved', value: 18, total: 47, color: 'green' },
                { label: 'Blocked', value: 5, total: 47, color: 'red' },
                { label: 'Cancelled', value: 0, total: 47, color: 'slate' }
              ]}
            />

            {/* Top Impacted Teams */}
            <RankingList
              title="Most Impacted Teams"
              items={[
                { label: 'Engineering', value: '14 dependencies', rank: 1, trend: 'up' },
                { label: 'DevOps', value: '8 dependencies', rank: 2, trend: 'same' },
                { label: 'Mobile Team', value: '6 dependencies', rank: 3, trend: 'up' },
                { label: 'Product Team', value: '5 dependencies', rank: 4, trend: 'down' },
                { label: 'QA Team', value: '4 dependencies', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Resolution"
                value="8.4 days"
                trend="up"
                change="-1.2d"
              />
              <MiniKPI
                label="Block Rate"
                value="11%"
                trend="down"
                change="-3%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Dependency resolved',
                  subject: 'Testing depends on Feature',
                  time: '4 days ago',
                  type: 'success'
                },
                {
                  action: 'Task blocked',
                  subject: 'Mobile UI depends on Design',
                  time: '5 days ago',
                  type: 'error'
                },
                {
                  action: 'Dependency added',
                  subject: 'Documentation depends on API',
                  time: '6 days ago',
                  type: 'info'
                },
                {
                  action: 'Blocker cleared',
                  subject: 'Marketing campaign unblocked',
                  time: '1 week ago',
                  type: 'success'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
