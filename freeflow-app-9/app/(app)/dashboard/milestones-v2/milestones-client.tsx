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
  useMilestones,
  useMilestoneMutations,
  getMilestoneStatusColor,
  getMilestoneTypeColor,
  getMilestonePriorityColor,
  formatCurrency,
  type Milestone
} from '@/lib/hooks/use-milestones'

type ViewMode = 'all' | 'in-progress' | 'upcoming' | 'at-risk'

interface MilestonesClientProps {
  initialMilestones: Milestone[]
}

export default function MilestonesClient({ initialMilestones }: MilestonesClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { milestones, stats, isLoading } = useMilestones(initialMilestones, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { createMilestone, isCreating } = useMilestoneMutations()

  const filteredMilestones = viewMode === 'all'
    ? milestones
    : milestones.filter(m => m.status === viewMode)

  const handleCreateMilestone = () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    createMilestone({
      name: 'New Milestone',
      description: 'Milestone description',
      type: 'project',
      priority: 'medium',
      due_date: dueDate
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Milestone Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track and manage project milestones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateMilestone}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-rose-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Milestones',
              value: (stats.inProgress + stats.upcoming).toString(),
              change: '+4',
              trend: 'up' as const,
              subtitle: 'across all projects'
            },
            {
              label: 'On-Time Delivery',
              value: `${stats.onTimeRate.toFixed(0)}%`,
              change: '+5%',
              trend: 'up' as const,
              subtitle: 'completion rate'
            },
            {
              label: 'At Risk',
              value: stats.atRisk.toString(),
              change: '-2',
              trend: stats.atRisk > 0 ? 'down' as const : 'same' as const,
              subtitle: 'require attention'
            },
            {
              label: 'Avg Progress',
              value: `${stats.avgProgress.toFixed(0)}%`,
              change: '+8%',
              trend: 'up' as const,
              subtitle: 'overall completion'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Milestone', icon: '🎯', onClick: handleCreateMilestone },
            { label: 'Timeline View', icon: '📅', onClick: () => {} },
            { label: 'Gantt Chart', icon: '📊', onClick: () => {} },
            { label: 'Risk Assessment', icon: '⚠️', onClick: () => {} },
            { label: 'Dependencies', icon: '🔗', onClick: () => {} },
            { label: 'Status Report', icon: '📋', onClick: () => {} },
            { label: 'Analytics', icon: '📈', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Milestones"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="In Progress"
            isActive={viewMode === 'in-progress'}
            onClick={() => setViewMode('in-progress')}
          />
          <PillButton
            label="Upcoming"
            isActive={viewMode === 'upcoming'}
            onClick={() => setViewMode('upcoming')}
          />
          <PillButton
            label="At Risk"
            isActive={viewMode === 'at-risk'}
            onClick={() => setViewMode('at-risk')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Milestones List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Milestones ({filteredMilestones.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                </div>
              ) : filteredMilestones.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No milestones found. Click "Create Milestone" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {milestone.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getMilestoneStatusColor(milestone.status)}`}>
                              {milestone.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getMilestoneTypeColor(milestone.type)}`}>
                              {milestone.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getMilestonePriorityColor(milestone.priority)}`}>
                              {milestone.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-rose-500">👤</span>
                              Owner: {milestone.owner_name || 'Unassigned'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-rose-500">👥</span>
                              {milestone.team_name || 'No team'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-rose-500">📅</span>
                              Due: {milestone.due_date || 'TBD'}
                            </span>
                            {milestone.days_remaining > 0 ? (
                              <span className={`flex items-center gap-1 ${milestone.days_remaining <= 7 ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                                <span className="text-rose-500">⏰</span>
                                {milestone.days_remaining} days left
                              </span>
                            ) : milestone.days_remaining < 0 ? (
                              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                                <span>⚠️</span>
                                {Math.abs(milestone.days_remaining)} days overdue
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                            {milestone.progress}%
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Progress
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Deliverables</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {milestone.completed_deliverables}/{milestone.deliverables}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Budget</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatCurrency(milestone.budget, milestone.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Spent</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatCurrency(milestone.spent, milestone.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Dependencies</div>
                          <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                            {milestone.dependencies}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>Progress: {milestone.progress}%</span>
                          <span>Stakeholders: {milestone.stakeholders?.join(', ') || 'None'}</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-600 to-pink-600 rounded-full transition-all duration-500"
                            style={{ width: `${milestone.progress}%` }}
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

            {/* Upcoming Milestones */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Upcoming Milestones</h3>
              <div className="space-y-3">
                {milestones.filter(m => m.days_remaining > 0).slice(0, 3).map((milestone) => (
                  <div
                    key={`upcoming-${milestone.id}`}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors text-sm mb-2">
                      {milestone.name}
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={`px-2 py-1 rounded-full border ${getMilestonePriorityColor(milestone.priority)}`}>
                        {milestone.priority}
                      </span>
                      <span className={`font-medium ${milestone.days_remaining <= 7 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {milestone.days_remaining} days
                      </span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-pink-600 rounded-full"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
                {milestones.filter(m => m.days_remaining > 0).length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                    No upcoming milestones
                  </div>
                )}
              </div>
            </div>

            {/* Milestone Status */}
            <ProgressCard
              title="Milestone Status"
              items={[
                { label: 'Completed', value: stats.completed, total: stats.total, color: 'green' },
                { label: 'In Progress', value: stats.inProgress, total: stats.total, color: 'yellow' },
                { label: 'At Risk', value: stats.atRisk, total: stats.total, color: 'red' },
                { label: 'Upcoming', value: stats.upcoming, total: stats.total, color: 'blue' },
                { label: 'Missed', value: stats.missed, total: stats.total, color: 'orange' }
              ]}
            />

            {/* Top Milestone Owners */}
            <RankingList
              title="Top Milestone Owners"
              items={[
                { label: 'Emily Rodriguez', value: '6 milestones', rank: 1, trend: 'up' },
                { label: 'Michael Chen', value: '5 milestones', rank: 2, trend: 'same' },
                { label: 'Sarah Johnson', value: '4 milestones', rank: 3, trend: 'up' },
                { label: 'David Kim', value: '3 milestones', rank: 4, trend: 'down' },
                { label: 'Jessica Williams', value: '2 milestones', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Budget Used"
                value="72%"
                trend="up"
                change="+8%"
              />
              <MiniKPI
                label="Avg Completion"
                value={`${stats.avgProgress.toFixed(0)}%`}
                trend="up"
                change="+5%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Milestone completed',
                  subject: 'Infrastructure Migration',
                  time: '4 days ago',
                  type: 'success'
                },
                {
                  action: 'Milestone at risk',
                  subject: 'Security Compliance Audit',
                  time: '1 day ago',
                  type: 'error'
                },
                {
                  action: 'Progress updated',
                  subject: 'Mobile App Beta - 84%',
                  time: '3 hours ago',
                  type: 'info'
                },
                {
                  action: 'Milestone created',
                  subject: 'New milestone added',
                  time: '1 week ago',
                  type: 'info'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
