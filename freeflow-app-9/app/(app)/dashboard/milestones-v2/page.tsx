'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type MilestoneStatus = 'upcoming' | 'in-progress' | 'at-risk' | 'completed' | 'missed'
type MilestoneType = 'project' | 'product' | 'business' | 'technical' | 'compliance'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ViewMode = 'all' | 'in-progress' | 'upcoming' | 'at-risk'

export default function MilestonesV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample milestones data
  const milestones = [
    {
      id: 'MLS-2847',
      name: 'Product Launch - Version 2.0',
      type: 'product' as const,
      status: 'in-progress' as const,
      priority: 'critical' as const,
      dueDate: '2024-03-15',
      daysRemaining: 30,
      progress: 72,
      owner: 'Emily Rodriguez',
      team: 'Product Team',
      deliverables: 12,
      completedDeliverables: 9,
      budget: 250000,
      spent: 180000,
      dependencies: 4,
      stakeholders: ['CEO', 'CTO', 'Product VP']
    },
    {
      id: 'MLS-2846',
      name: 'Security Compliance Audit',
      type: 'compliance' as const,
      status: 'at-risk' as const,
      priority: 'critical' as const,
      dueDate: '2024-02-28',
      daysRemaining: 14,
      progress: 58,
      owner: 'Michael Chen',
      team: 'Security Team',
      deliverables: 8,
      completedDeliverables: 5,
      budget: 80000,
      spent: 72000,
      dependencies: 2,
      stakeholders: ['CISO', 'Legal', 'Compliance']
    },
    {
      id: 'MLS-2845',
      name: 'Mobile App Beta Release',
      type: 'product' as const,
      status: 'in-progress' as const,
      priority: 'high' as const,
      dueDate: '2024-03-01',
      daysRemaining: 16,
      progress: 84,
      owner: 'Sarah Johnson',
      team: 'Mobile Team',
      deliverables: 15,
      completedDeliverables: 13,
      budget: 180000,
      spent: 152000,
      dependencies: 3,
      stakeholders: ['Product VP', 'Engineering VP']
    },
    {
      id: 'MLS-2844',
      name: 'Infrastructure Migration',
      type: 'technical' as const,
      status: 'completed' as const,
      priority: 'high' as const,
      dueDate: '2024-02-10',
      daysRemaining: 0,
      progress: 100,
      owner: 'David Kim',
      team: 'DevOps Team',
      deliverables: 10,
      completedDeliverables: 10,
      budget: 120000,
      spent: 115000,
      dependencies: 0,
      stakeholders: ['CTO', 'Engineering VP']
    },
    {
      id: 'MLS-2843',
      name: 'Q1 Business Goals Achievement',
      type: 'business' as const,
      status: 'in-progress' as const,
      priority: 'medium' as const,
      dueDate: '2024-03-31',
      daysRemaining: 46,
      progress: 68,
      owner: 'Jessica Williams',
      team: 'Executive Team',
      deliverables: 6,
      completedDeliverables: 4,
      budget: 0,
      spent: 0,
      dependencies: 5,
      stakeholders: ['CEO', 'CFO', 'Board']
    },
    {
      id: 'MLS-2842',
      name: 'API Documentation Update',
      type: 'technical' as const,
      status: 'missed' as const,
      priority: 'low' as const,
      dueDate: '2024-02-05',
      daysRemaining: -9,
      progress: 92,
      owner: 'Lisa Anderson',
      team: 'Engineering Team',
      deliverables: 4,
      completedDeliverables: 3,
      budget: 20000,
      spent: 18000,
      dependencies: 0,
      stakeholders: ['Engineering VP']
    }
  ]

  const upcomingMilestones = [
    {
      id: 'UPC-8471',
      name: 'Security Compliance Audit',
      daysUntil: 14,
      progress: 58,
      priority: 'critical' as const
    },
    {
      id: 'UPC-8470',
      name: 'Mobile App Beta Release',
      daysUntil: 16,
      progress: 84,
      priority: 'high' as const
    },
    {
      id: 'UPC-8469',
      name: 'Product Launch - Version 2.0',
      daysUntil: 30,
      progress: 72,
      priority: 'critical' as const
    }
  ]

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'at-risk': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'missed': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  }

  const getTypeColor = (type: MilestoneType) => {
    switch (type) {
      case 'project': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'product': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'business': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'technical': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'compliance': return 'bg-red-500/10 text-red-500 border-red-500/20'
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

  const filteredMilestones = viewMode === 'all'
    ? milestones
    : milestones.filter(milestone => milestone.status === viewMode)

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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
            <button className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-rose-500/50 transition-all duration-300">
              Create Milestone
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Milestones',
              value: '24',
              change: '+4',
              trend: 'up' as const,
              subtitle: 'across all projects'
            },
            {
              label: 'On-Time Delivery',
              value: '86%',
              change: '+5%',
              trend: 'up' as const,
              subtitle: 'completion rate'
            },
            {
              label: 'At Risk',
              value: '4',
              change: '-2',
              trend: 'up' as const,
              subtitle: 'require attention'
            },
            {
              label: 'Avg Progress',
              value: '74%',
              change: '+8%',
              trend: 'up' as const,
              subtitle: 'overall completion'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Milestone', icon: '🎯', onClick: () => {} },
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
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(milestone.type)}`}>
                            {milestone.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(milestone.priority)}`}>
                            {milestone.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-rose-500">👤</span>
                            Owner: {milestone.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-rose-500">👥</span>
                            {milestone.team}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-rose-500">📅</span>
                            Due: {milestone.dueDate}
                          </span>
                          {milestone.daysRemaining > 0 ? (
                            <span className={`flex items-center gap-1 ${milestone.daysRemaining <= 7 ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                              <span className="text-rose-500">⏰</span>
                              {milestone.daysRemaining} days left
                            </span>
                          ) : milestone.daysRemaining < 0 ? (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                              <span>⚠️</span>
                              {Math.abs(milestone.daysRemaining)} days overdue
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
                          {milestone.completedDeliverables}/{milestone.deliverables}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Budget</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(milestone.budget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Spent</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(milestone.spent)}
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
                        <span>Stakeholders: {milestone.stakeholders.join(', ')}</span>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Upcoming Milestones */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Upcoming Milestones</h3>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors text-sm mb-2">
                      {milestone.name}
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={`px-2 py-1 rounded-full border ${getPriorityColor(milestone.priority)}`}>
                        {milestone.priority}
                      </span>
                      <span className={`font-medium ${milestone.daysUntil <= 7 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {milestone.daysUntil} days
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
              </div>
            </div>

            {/* Milestone Status */}
            <ProgressCard
              title="Milestone Status"
              items={[
                { label: 'Completed', value: 8, total: 24, color: 'green' },
                { label: 'In Progress', value: 10, total: 24, color: 'yellow' },
                { label: 'At Risk', value: 4, total: 24, color: 'red' },
                { label: 'Upcoming', value: 2, total: 24, color: 'blue' },
                { label: 'Missed', value: 0, total: 24, color: 'orange' }
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
                value="74%"
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
                  action: 'Milestone missed',
                  subject: 'API Documentation Update',
                  time: '9 days ago',
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
