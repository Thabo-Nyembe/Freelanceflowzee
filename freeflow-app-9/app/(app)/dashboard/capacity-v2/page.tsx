'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TeamStatus = 'under-capacity' | 'optimal' | 'near-capacity' | 'over-capacity'
type TimeFrame = 'week' | 'sprint' | 'month' | 'quarter'
type DepartmentType = 'engineering' | 'design' | 'product' | 'marketing' | 'sales' | 'operations'
type ViewMode = 'all' | 'optimal' | 'near-capacity' | 'over-capacity'

export default function CapacityV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample capacity data
  const teamCapacity = [
    {
      id: 'CAP-2847',
      team: 'Engineering Team A',
      department: 'engineering' as const,
      status: 'near-capacity' as const,
      totalCapacity: 400,
      allocated: 372,
      available: 28,
      utilization: 93,
      members: 10,
      timeFrame: 'sprint' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      projects: ['Product V2.0', 'API Rewrite'],
      lead: 'Emily Rodriguez'
    },
    {
      id: 'CAP-2846',
      team: 'Design Team',
      department: 'design' as const,
      status: 'over-capacity' as const,
      totalCapacity: 280,
      allocated: 336,
      available: -56,
      utilization: 120,
      members: 7,
      timeFrame: 'sprint' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      projects: ['Design System', 'Mobile UI', 'Rebrand'],
      lead: 'Michael Chen'
    },
    {
      id: 'CAP-2845',
      team: 'Mobile Team',
      department: 'engineering' as const,
      status: 'optimal' as const,
      totalCapacity: 320,
      allocated: 272,
      available: 48,
      utilization: 85,
      members: 8,
      timeFrame: 'sprint' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      projects: ['Mobile App Beta'],
      lead: 'Sarah Johnson'
    },
    {
      id: 'CAP-2844',
      team: 'DevOps Team',
      department: 'engineering' as const,
      status: 'under-capacity' as const,
      totalCapacity: 280,
      allocated: 168,
      available: 112,
      utilization: 60,
      members: 7,
      timeFrame: 'sprint' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      projects: ['Infrastructure'],
      lead: 'David Kim'
    },
    {
      id: 'CAP-2843',
      team: 'QA Team',
      department: 'engineering' as const,
      status: 'optimal' as const,
      totalCapacity: 360,
      allocated: 308,
      available: 52,
      utilization: 85.6,
      members: 9,
      timeFrame: 'sprint' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      projects: ['Product V2.0', 'Mobile App', 'Regression'],
      lead: 'Jessica Williams'
    },
    {
      id: 'CAP-2842',
      team: 'Product Team',
      department: 'product' as const,
      status: 'near-capacity' as const,
      totalCapacity: 240,
      allocated: 228,
      available: 12,
      utilization: 95,
      members: 6,
      timeFrame: 'sprint' as const,
      startDate: '2024-02-12',
      endDate: '2024-02-25',
      projects: ['Product V2.0', 'Roadmap'],
      lead: 'Lisa Anderson'
    }
  ]

  const getStatusColor = (status: TeamStatus) => {
    switch (status) {
      case 'under-capacity': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'optimal': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'near-capacity': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'over-capacity': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getDepartmentColor = (dept: DepartmentType) => {
    switch (dept) {
      case 'engineering': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'design': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      case 'product': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'marketing': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'sales': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'operations': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    }
  }

  const filteredTeams = viewMode === 'all'
    ? teamCapacity
    : teamCapacity.filter(team => team.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-lime-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
              Capacity Planning
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and optimize team capacity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-lime-600 to-green-600 text-white rounded-lg hover:shadow-lg hover:shadow-lime-500/50 transition-all duration-300">
              Plan Capacity
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Capacity',
              value: '1,880h',
              change: '+120h',
              trend: 'up' as const,
              subtitle: 'this sprint'
            },
            {
              label: 'Avg Utilization',
              value: '87%',
              change: '+4%',
              trend: 'up' as const,
              subtitle: 'across all teams'
            },
            {
              label: 'Available Hours',
              value: '196h',
              change: '-48h',
              trend: 'down' as const,
              subtitle: 'unallocated capacity'
            },
            {
              label: 'Teams at Risk',
              value: '2',
              change: '-1',
              trend: 'up' as const,
              subtitle: 'over or near capacity'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Forecast', icon: '📊', onClick: () => {} },
            { label: 'Rebalance', icon: '⚖️', onClick: () => {} },
            { label: 'Timeline', icon: '📅', onClick: () => {} },
            { label: 'Scenarios', icon: '🎯', onClick: () => {} },
            { label: 'Availability', icon: '✅', onClick: () => {} },
            { label: 'Workload', icon: '📈', onClick: () => {} },
            { label: 'Reports', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Teams"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Optimal"
            isActive={viewMode === 'optimal'}
            onClick={() => setViewMode('optimal')}
          />
          <PillButton
            label="Near Capacity"
            isActive={viewMode === 'near-capacity'}
            onClick={() => setViewMode('near-capacity')}
          />
          <PillButton
            label="Over Capacity"
            isActive={viewMode === 'over-capacity'}
            onClick={() => setViewMode('over-capacity')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Team Capacity List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Team Capacity ({filteredTeams.length})
              </h2>
              <div className="space-y-3">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-lime-500/50 dark:hover:border-lime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                            {team.team}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(team.status)}`}>
                            {team.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getDepartmentColor(team.department)}`}>
                            {team.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-lime-500">👥</span>
                            {team.members} members
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-lime-500">👤</span>
                            Lead: {team.lead}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-lime-500">📅</span>
                            {team.startDate} - {team.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          team.utilization > 100 ? 'text-red-600 dark:text-red-400' :
                          team.utilization >= 90 ? 'text-yellow-600 dark:text-yellow-400' :
                          team.utilization >= 70 ? 'text-lime-600 dark:text-lime-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {team.utilization}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Utilization
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Total Capacity</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{team.totalCapacity}h</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Allocated</div>
                        <div className="text-lg font-bold text-lime-600 dark:text-lime-400">{team.allocated}h</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Available</div>
                        <div className={`text-lg font-bold ${team.available >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {team.available >= 0 ? team.available : Math.abs(team.available)}h {team.available < 0 ? 'over' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Capacity: {team.utilization}%</span>
                        <span>{team.allocated}/{team.totalCapacity} hours</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            team.utilization > 100
                              ? 'bg-gradient-to-r from-red-600 to-orange-600'
                              : team.utilization >= 90
                              ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                              : 'bg-gradient-to-r from-lime-600 to-green-600'
                          }`}
                          style={{ width: `${Math.min(team.utilization, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Projects:</div>
                      <div className="flex flex-wrap gap-2">
                        {team.projects.map((project) => (
                          <span key={project} className="px-2 py-1 rounded-full text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300">
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Department Capacity */}
            <ProgressCard
              title="Capacity by Department"
              items={[
                { label: 'Engineering', value: 1340, total: 1880, color: 'purple' },
                { label: 'Design', value: 280, total: 1880, color: 'pink' },
                { label: 'Product', value: 240, total: 1880, color: 'blue' },
                { label: 'Marketing', value: 20, total: 1880, color: 'green' }
              ]}
            />

            {/* Top Utilized Teams */}
            <RankingList
              title="Top Utilized Teams"
              items={[
                { label: 'Design Team', value: '120% capacity', rank: 1, trend: 'up' },
                { label: 'Product Team', value: '95% capacity', rank: 2, trend: 'same' },
                { label: 'Engineering A', value: '93% capacity', rank: 3, trend: 'up' },
                { label: 'QA Team', value: '85.6% capacity', rank: 4, trend: 'down' },
                { label: 'Mobile Team', value: '85% capacity', rank: 5, trend: 'up' }
              ]}
            />

            {/* Capacity Trends */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Capacity Trends</h3>
              <div className="space-y-3">
                {[
                  { period: 'This Sprint', utilization: 87, trend: '+4%' },
                  { period: 'Last Sprint', utilization: 83, trend: '+2%' },
                  { period: 'Last Month', utilization: 81, trend: '+3%' },
                  { period: 'Last Quarter', utilization: 78, trend: '+5%' }
                ].map((item) => (
                  <div key={item.period} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.period}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">{item.trend}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{item.utilization}% utilization</span>
                    </div>
                    <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-600 to-green-600 rounded-full"
                        style={{ width: `${item.utilization}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Team Size"
                value="7.8"
                trend="up"
                change="+0.5"
              />
              <MiniKPI
                label="Hours/Member"
                value="40h"
                trend="same"
                change="0h"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Over-capacity alert',
                  subject: 'Design Team - 120% capacity',
                  time: '2 hours ago',
                  type: 'error'
                },
                {
                  action: 'Capacity optimized',
                  subject: 'Mobile Team - 85% capacity',
                  time: '1 day ago',
                  type: 'success'
                },
                {
                  action: 'Team rebalanced',
                  subject: 'DevOps - 60% to 75%',
                  time: '2 days ago',
                  type: 'info'
                },
                {
                  action: 'Capacity increased',
                  subject: 'Engineering A - +40 hours',
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
