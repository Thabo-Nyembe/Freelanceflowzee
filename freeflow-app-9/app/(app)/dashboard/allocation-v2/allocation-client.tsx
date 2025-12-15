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
  useAllocations,
  useAllocationMutations,
  getAllocationStatusColor,
  getAllocationTypeColor,
  getAllocationPriorityColor,
  formatCurrency,
  type Allocation
} from '@/lib/hooks/use-allocations'

type ViewMode = 'all' | 'active' | 'pending' | 'completed'

interface AllocationClientProps {
  initialAllocations: Allocation[]
}

export default function AllocationClient({ initialAllocations }: AllocationClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { allocations, stats, isLoading } = useAllocations(initialAllocations, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { createAllocation, isCreating } = useAllocationMutations()

  const filteredAllocations = viewMode === 'all'
    ? allocations
    : allocations.filter(a => a.status === viewMode)

  const handleCreateAllocation = () => {
    const now = new Date()
    const startDate = now.toISOString().split('T')[0]
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    createAllocation({
      resource_name: 'New Resource',
      project_name: 'New Project',
      allocation_type: 'full-time',
      priority: 'medium',
      hours_per_week: 40,
      allocated_hours: 40,
      start_date: startDate,
      end_date: endDate,
      billable_rate: 100
    })
  }

  // Calculate project summaries
  const projectSummaries = allocations.reduce((acc, alloc) => {
    if (!acc[alloc.project_name]) {
      acc[alloc.project_name] = { hours: 0, resources: 0, value: 0 }
    }
    acc[alloc.project_name].hours += alloc.allocated_hours
    acc[alloc.project_name].resources += 1
    acc[alloc.project_name].value += Number(alloc.project_value)
    return acc
  }, {} as Record<string, { hours: number; resources: number; value: number }>)

  const projectAllocations = Object.entries(projectSummaries)
    .map(([project, data]) => ({ project, ...data }))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-fuchsia-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              Resource Allocation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage resource assignments and project allocations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateAllocation}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'New Allocation'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Allocations',
              value: stats.active.toString(),
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all projects'
            },
            {
              label: 'Total Hours',
              value: `${stats.totalHours.toLocaleString()}h`,
              change: '+420h',
              trend: 'up' as const,
              subtitle: 'allocated this month'
            },
            {
              label: 'Resource Value',
              value: formatCurrency(stats.totalValue),
              change: '+52K',
              trend: 'up' as const,
              subtitle: 'billable allocation'
            },
            {
              label: 'Avg Utilization',
              value: `${stats.avgUtilization.toFixed(0)}%`,
              change: '+4%',
              trend: 'up' as const,
              subtitle: 'efficiency rate'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Allocate', icon: '➕', onClick: handleCreateAllocation },
            { label: 'Reassign', icon: '🔄', onClick: () => {} },
            { label: 'Timeline', icon: '📅', onClick: () => {} },
            { label: 'Conflicts', icon: '⚠️', onClick: () => {} },
            { label: 'Forecast', icon: '📊', onClick: () => {} },
            { label: 'Budget', icon: '💰', onClick: () => {} },
            { label: 'Reports', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Allocations"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Pending"
            isActive={viewMode === 'pending'}
            onClick={() => setViewMode('pending')}
          />
          <PillButton
            label="Completed"
            isActive={viewMode === 'completed'}
            onClick={() => setViewMode('completed')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Allocations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Allocations ({filteredAllocations.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
                </div>
              ) : filteredAllocations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No allocations found. Click "New Allocation" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAllocations.map((allocation) => (
                    <div
                      key={allocation.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-fuchsia-500/50 dark:hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                              {allocation.resource_name} → {allocation.project_name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getAllocationStatusColor(allocation.status)}`}>
                              {allocation.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getAllocationTypeColor(allocation.allocation_type)}`}>
                              {allocation.allocation_type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getAllocationPriorityColor(allocation.priority)}`}>
                              {allocation.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-fuchsia-500">💼</span>
                              {allocation.resource_role || 'No role'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-fuchsia-500">👤</span>
                              Manager: {allocation.manager_name || 'Unassigned'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-fuchsia-500">📅</span>
                              {allocation.start_date || 'TBD'} - {allocation.end_date || 'TBD'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                            {Number(allocation.utilization).toFixed(0)}%
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Utilization
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Weekly Hours</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {allocation.allocated_hours}/{allocation.hours_per_week}h
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Weeks Left</div>
                          <div className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400">
                            {allocation.weeks_remaining}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Hourly Rate</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            ${allocation.billable_rate}/hr
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Project Value</div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(Number(allocation.project_value), allocation.currency)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>Allocation: {Number(allocation.utilization).toFixed(0)}%</span>
                          <span>{allocation.allocated_hours}/{allocation.hours_per_week} hours per week</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(Number(allocation.utilization), 100)}%` }}
                          />
                        </div>
                      </div>

                      {allocation.skills && allocation.skills.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Skills:</div>
                          <div className="flex flex-wrap gap-2">
                            {allocation.skills.map((skill) => (
                              <span key={skill} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Project Allocations */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Project Allocations</h3>
              <div className="space-y-3">
                {projectAllocations.map((project) => (
                  <div
                    key={project.project}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-fuchsia-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors text-sm mb-2">
                      {project.project}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span>{project.hours}h total</span>
                      <span>{project.resources} resources</span>
                      <span className="col-span-2">{formatCurrency(project.value)} budget</span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full"
                        style={{ width: `${Math.min((project.hours / stats.totalHours) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {projectAllocations.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                    No projects yet
                  </div>
                )}
              </div>
            </div>

            {/* Allocation Types */}
            <ProgressCard
              title="Allocation Types"
              items={[
                { label: 'Full-Time', value: allocations.filter(a => a.allocation_type === 'full-time').length, total: stats.total, color: 'purple' },
                { label: 'Part-Time', value: allocations.filter(a => a.allocation_type === 'part-time').length, total: stats.total, color: 'blue' },
                { label: 'Temporary', value: allocations.filter(a => a.allocation_type === 'temporary').length, total: stats.total, color: 'orange' },
                { label: 'Contract', value: allocations.filter(a => a.allocation_type === 'contract').length, total: stats.total, color: 'cyan' }
              ]}
            />

            {/* Top Projects by Hours */}
            <RankingList
              title="Top Projects by Hours"
              items={Object.entries(projectSummaries)
                .sort(([, a], [, b]) => b.hours - a.hours)
                .slice(0, 5)
                .map(([project, data], i) => ({
                  label: project,
                  value: `${data.hours} hours`,
                  rank: i + 1,
                  trend: i % 2 === 0 ? 'up' : 'same'
                }))}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Allocation"
                value={`${stats.total > 0 ? Math.round(stats.totalHours / stats.total) : 0}h/week`}
                trend="up"
                change="+4h"
              />
              <MiniKPI
                label="Billable Rate"
                value={`$${allocations.length > 0 ? Math.round(allocations.reduce((s, a) => s + a.billable_rate, 0) / allocations.length) : 0}/h`}
                trend="up"
                change="+$5"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Resource allocated',
                  subject: 'Sarah Johnson - Product V2.0',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Allocation completed',
                  subject: 'Infrastructure Migration',
                  time: '4 days ago',
                  type: 'success'
                },
                {
                  action: 'Allocation pending',
                  subject: 'Jessica - Mobile App Testing',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Allocation cancelled',
                  subject: 'Documentation Update',
                  time: '2 days ago',
                  type: 'warning'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
