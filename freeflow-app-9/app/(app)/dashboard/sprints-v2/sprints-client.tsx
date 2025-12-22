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
  useSprints,
  useSprintTasks,
  useSprintMutations,
  getSprintStatusColor,
  getTaskStatusColor,
  getTaskPriorityColor,
  getCompletionPercentage,
  type Sprint,
  type SprintTask
} from '@/lib/hooks/use-sprints'

type ViewMode = 'all' | 'active' | 'planning' | 'completed'

interface SprintsClientProps {
  initialSprints: Sprint[]
  initialTasks: SprintTask[]
}

export default function SprintsClient({ initialSprints, initialTasks }: SprintsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { sprints, stats, isLoading } = useSprints(initialSprints, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { tasks } = useSprintTasks(initialTasks)

  const {
    createSprint,
    startSprint,
    completeSprint,
    createTask,
    isCreatingSprint,
    isStartingSprint
  } = useSprintMutations()

  const filteredSprints = viewMode === 'all'
    ? sprints
    : sprints.filter(sprint => sprint.status === viewMode)

  const handleCreateSprint = () => {
    const sprintNumber = sprints.length + 1
    const now = new Date()
    const startDate = now.toISOString().split('T')[0]
    const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    createSprint({
      name: `Sprint ${sprintNumber}`,
      description: `Sprint ${sprintNumber} goals and objectives`,
      start_date: startDate,
      end_date: endDate,
      status: 'planning'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:bg-none dark:bg-gray-900">
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
            <button
              onClick={handleCreateSprint}
              disabled={isCreatingSprint}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreatingSprint ? 'Creating...' : 'Create Sprint'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Sprints',
              value: stats.active.toString(),
              change: '+2',
              trend: 'up' as const,
              subtitle: 'across all teams'
            },
            {
              label: 'Avg Velocity',
              value: stats.avgVelocity > 0 ? stats.avgVelocity.toFixed(0) : '0',
              change: '+4',
              trend: 'up' as const,
              subtitle: 'story points per sprint'
            },
            {
              label: 'Sprint Completion',
              value: `${stats.completionRate.toFixed(0)}%`,
              change: '+3%',
              trend: 'up' as const,
              subtitle: 'on-time delivery'
            },
            {
              label: 'Total Tasks',
              value: stats.totalTasks.toString(),
              change: '+' + stats.completedTasks,
              trend: 'up' as const,
              subtitle: `${stats.completedTasks} completed`
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Sprint', icon: '➕', onClick: handleCreateSprint },
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : filteredSprints.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No sprints found. Click "Create Sprint" to get started.
                </div>
              ) : (
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
                            <span className={`px-2 py-1 rounded-full text-xs border ${getSprintStatusColor(sprint.status)}`}>
                              {sprint.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-teal-500">👥</span>
                              {sprint.team_name || 'No team'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-teal-500">👤</span>
                              {sprint.scrum_master || 'No SM'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-teal-500">📅</span>
                              {sprint.start_date || 'TBD'} - {sprint.end_date || 'TBD'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {getCompletionPercentage(sprint.completed_tasks, sprint.total_tasks)}%
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Complete
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{sprint.completed_tasks}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Done</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{sprint.in_progress_tasks}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">{sprint.blocked_tasks}</div>
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
                          {sprint.days_remaining > 0 && (
                            <span className={sprint.days_remaining <= 3 ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                              {sprint.days_remaining} days remaining
                            </span>
                          )}
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full transition-all duration-500"
                            style={{ width: `${getCompletionPercentage(sprint.completed_tasks, sprint.total_tasks)}%` }}
                          />
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

            {/* Sprint Tasks */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Sprint Tasks</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
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
                          {task.assignee_name || 'Unassigned'}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full border ${getTaskPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{task.story_points} pts</span>
                    </div>
                    <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                    No active tasks
                  </div>
                )}
              </div>
            </div>

            {/* Sprint Health */}
            <ProgressCard
              title="Sprint Health Metrics"
              items={[
                { label: 'Completed', value: stats.completedTasks, total: stats.totalTasks, color: 'green' },
                { label: 'In Progress', value: stats.totalTasks - stats.completedTasks, total: stats.totalTasks, color: 'yellow' },
                { label: 'Active Sprints', value: stats.active, total: stats.total, color: 'blue' },
                { label: 'Planning', value: stats.planning, total: stats.total, color: 'purple' },
                { label: 'Completed Sprints', value: stats.completed, total: stats.total, color: 'slate' }
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
