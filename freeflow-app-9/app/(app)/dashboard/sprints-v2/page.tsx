'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled'
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ViewMode = 'all' | 'active' | 'planning' | 'completed'

export default function SprintsV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample sprints data
  const sprints = [
    {
      id: 'SPR-2847',
      name: 'Sprint 24 - Q1 Features',
      status: 'active' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      daysRemaining: 11,
      totalTasks: 42,
      completedTasks: 28,
      inProgressTasks: 10,
      blockedTasks: 4,
      velocity: 38,
      team: 'Engineering Team A',
      scrumMaster: 'Emily Rodriguez',
      capacity: 280,
      committed: 252,
      burned: 168
    },
    {
      id: 'SPR-2846',
      name: 'Sprint 23 - Bug Fixes',
      status: 'completed' as const,
      startDate: '2024-01-29',
      endDate: '2024-02-11',
      daysRemaining: 0,
      totalTasks: 38,
      completedTasks: 38,
      inProgressTasks: 0,
      blockedTasks: 0,
      velocity: 42,
      team: 'Engineering Team A',
      scrumMaster: 'Emily Rodriguez',
      capacity: 280,
      committed: 228,
      burned: 228
    },
    {
      id: 'SPR-2845',
      name: 'Sprint 24 - Mobile App',
      status: 'active' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      daysRemaining: 11,
      totalTasks: 36,
      completedTasks: 24,
      inProgressTasks: 8,
      blockedTasks: 4,
      velocity: 34,
      team: 'Mobile Team',
      scrumMaster: 'Michael Chen',
      capacity: 224,
      committed: 216,
      burned: 144
    },
    {
      id: 'SPR-2844',
      name: 'Sprint 25 - Design System',
      status: 'planning' as const,
      startDate: '2024-02-26',
      endDate: '2024-03-10',
      daysRemaining: 25,
      totalTasks: 28,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
      velocity: 0,
      team: 'Design Team',
      scrumMaster: 'Sarah Johnson',
      capacity: 196,
      committed: 168,
      burned: 0
    },
    {
      id: 'SPR-2843',
      name: 'Sprint 22 - Infrastructure',
      status: 'completed' as const,
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      daysRemaining: 0,
      totalTasks: 32,
      completedTasks: 30,
      inProgressTasks: 0,
      blockedTasks: 2,
      velocity: 36,
      team: 'DevOps Team',
      scrumMaster: 'David Kim',
      capacity: 224,
      committed: 192,
      burned: 180
    }
  ]

  const sprintTasks = [
    {
      id: 'TASK-8471',
      title: 'Implement user authentication flow',
      sprint: 'Sprint 24 - Q1 Features',
      status: 'in-progress' as const,
      priority: 'critical' as const,
      assignee: 'Sarah Johnson',
      storyPoints: 8,
      progress: 60
    },
    {
      id: 'TASK-8470',
      title: 'Design new dashboard layout',
      sprint: 'Sprint 24 - Q1 Features',
      status: 'review' as const,
      priority: 'high' as const,
      assignee: 'Michael Chen',
      storyPoints: 5,
      progress: 90
    },
    {
      id: 'TASK-8469',
      title: 'Fix payment gateway integration',
      sprint: 'Sprint 24 - Q1 Features',
      status: 'blocked' as const,
      priority: 'critical' as const,
      assignee: 'David Kim',
      storyPoints: 13,
      progress: 30
    },
    {
      id: 'TASK-8468',
      title: 'Update API documentation',
      sprint: 'Sprint 24 - Q1 Features',
      status: 'done' as const,
      priority: 'medium' as const,
      assignee: 'Emily Rodriguez',
      storyPoints: 3,
      progress: 100
    },
    {
      id: 'TASK-8467',
      title: 'Optimize database queries',
      sprint: 'Sprint 24 - Mobile App',
      status: 'in-progress' as const,
      priority: 'high' as const,
      assignee: 'Lisa Anderson',
      storyPoints: 8,
      progress: 45
    }
  ]

  const getStatusColor = (status: SprintStatus) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'completed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'review': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'blocked': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const filteredSprints = viewMode === 'all'
    ? sprints
    : sprints.filter(sprint => sprint.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Sprint Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Agile sprint planning and tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300">
              Create Sprint
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Sprints',
              value: '8',
              change: '+2',
              trend: 'up' as const,
              subtitle: 'across all teams'
            },
            {
              label: 'Avg Velocity',
              value: '38',
              change: '+4',
              trend: 'up' as const,
              subtitle: 'story points per sprint'
            },
            {
              label: 'Sprint Completion',
              value: '94%',
              change: '+3%',
              trend: 'up' as const,
              subtitle: 'on-time delivery'
            },
            {
              label: 'Team Capacity',
              value: '87%',
              change: '+2%',
              trend: 'up' as const,
              subtitle: 'utilization rate'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Sprint', icon: '➕', onClick: () => {} },
            { label: 'Backlog', icon: '📋', onClick: () => {} },
            { label: 'Sprint Board', icon: '📊', onClick: () => {} },
            { label: 'Burndown Chart', icon: '📈', onClick: () => {} },
            { label: 'Team Velocity', icon: '⚡', onClick: () => {} },
            { label: 'Retrospective', icon: '🔄', onClick: () => {} },
            { label: 'Reports', icon: '📊', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Sprints"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Planning"
            isActive={viewMode === 'planning'}
            onClick={() => setViewMode('planning')}
          />
          <PillButton
            label="Completed"
            isActive={viewMode === 'completed'}
            onClick={() => setViewMode('completed')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sprints List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Sprints ({filteredSprints.length})
              </h2>
              <div className="space-y-3">
                {filteredSprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {sprint.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(sprint.status)}`}>
                            {sprint.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-teal-500">👥</span>
                            {sprint.team}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-teal-500">👤</span>
                            {sprint.scrumMaster}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-teal-500">📅</span>
                            {sprint.startDate} - {sprint.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                          {Math.round((sprint.completedTasks / sprint.totalTasks) * 100)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Complete
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{sprint.completedTasks}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Done</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{sprint.inProgressTasks}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">{sprint.blockedTasks}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Blocked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{sprint.velocity}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Velocity</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Capacity: {sprint.capacity}h | Committed: {sprint.committed}h | Burned: {sprint.burned}h</span>
                        {sprint.daysRemaining > 0 && (
                          <span className={sprint.daysRemaining <= 3 ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                            {sprint.daysRemaining} days remaining
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full transition-all duration-500"
                          style={{ width: `${(sprint.completedTasks / sprint.totalTasks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Sprint Tasks */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Sprint Tasks</h3>
              <div className="space-y-3">
                {sprintTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-sm">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {task.assignee}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{task.storyPoints} pts</span>
                    </div>
                    <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sprint Health */}
            <ProgressCard
              title="Sprint Health Metrics"
              items={[
                { label: 'Completed', value: 28, total: 42, color: 'green' },
                { label: 'In Progress', value: 10, total: 42, color: 'yellow' },
                { label: 'Blocked', value: 4, total: 42, color: 'red' },
                { label: 'To Do', value: 0, total: 42, color: 'slate' },
                { label: 'In Review', value: 0, total: 42, color: 'purple' }
              ]}
            />

            {/* Top Performing Teams */}
            <RankingList
              title="Top Performing Teams"
              items={[
                { label: 'Engineering Team A', value: '42 velocity', rank: 1, trend: 'up' },
                { label: 'DevOps Team', value: '36 velocity', rank: 2, trend: 'same' },
                { label: 'Mobile Team', value: '34 velocity', rank: 3, trend: 'up' },
                { label: 'Design Team', value: '28 velocity', rank: 4, trend: 'down' },
                { label: 'QA Team', value: '24 velocity', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Story Points"
                value="6.8"
                trend="up"
                change="+0.4"
              />
              <MiniKPI
                label="Burndown Rate"
                value="12h/day"
                trend="up"
                change="+2h"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Task completed',
                  subject: 'Update API documentation',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Task blocked',
                  subject: 'Payment gateway integration',
                  time: '3 hours ago',
                  type: 'error'
                },
                {
                  action: 'Sprint started',
                  subject: 'Sprint 24 - Q1 Features',
                  time: '2 days ago',
                  type: 'info'
                },
                {
                  action: 'Sprint completed',
                  subject: 'Sprint 23 - Bug Fixes',
                  time: '3 days ago',
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
