'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type AllocationStatus = 'active' | 'pending' | 'completed' | 'cancelled'
type AllocationType = 'full-time' | 'part-time' | 'temporary' | 'contract'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ViewMode = 'all' | 'active' | 'pending' | 'completed'

export default function AllocationV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample allocation data
  const allocations = [
    {
      id: 'ALL-2847',
      resource: 'Sarah Johnson',
      role: 'Senior Developer',
      project: 'Product V2.0',
      allocationType: 'full-time' as const,
      status: 'active' as const,
      priority: 'critical' as const,
      hoursPerWeek: 40,
      allocatedHours: 38,
      utilization: 95,
      startDate: '2024-02-12',
      endDate: '2024-03-31',
      weeksRemaining: 6,
      billableRate: 125,
      projectValue: 23750,
      skills: ['React', 'TypeScript', 'Node.js'],
      manager: 'Emily Rodriguez'
    },
    {
      id: 'ALL-2846',
      resource: 'Michael Chen',
      role: 'Lead Designer',
      project: 'Design System',
      allocationType: 'part-time' as const,
      status: 'active' as const,
      priority: 'high' as const,
      hoursPerWeek: 40,
      allocatedHours: 24,
      utilization: 60,
      startDate: '2024-02-05',
      endDate: '2024-04-15',
      weeksRemaining: 10,
      billableRate: 110,
      projectValue: 26400,
      skills: ['Figma', 'UI/UX', 'Design Systems'],
      manager: 'Robert Brown'
    },
    {
      id: 'ALL-2845',
      resource: 'Emily Rodriguez',
      role: 'VP Engineering',
      project: 'Architecture Review',
      allocationType: 'part-time' as const,
      status: 'active' as const,
      priority: 'critical' as const,
      hoursPerWeek: 40,
      allocatedHours: 10,
      utilization: 25,
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      weeksRemaining: 2,
      billableRate: 150,
      projectValue: 6000,
      skills: ['Architecture', 'Leadership', 'Strategy'],
      manager: 'CTO'
    },
    {
      id: 'ALL-2844',
      resource: 'David Kim',
      role: 'DevOps Engineer',
      project: 'Infrastructure Migration',
      allocationType: 'temporary' as const,
      status: 'completed' as const,
      priority: 'high' as const,
      hoursPerWeek: 40,
      allocatedHours: 40,
      utilization: 100,
      startDate: '2024-01-15',
      endDate: '2024-02-10',
      weeksRemaining: 0,
      billableRate: 130,
      projectValue: 20800,
      skills: ['AWS', 'Kubernetes', 'Terraform'],
      manager: 'Emily Rodriguez'
    },
    {
      id: 'ALL-2843',
      resource: 'Jessica Williams',
      role: 'QA Engineer',
      project: 'Mobile App Testing',
      allocationType: 'full-time' as const,
      status: 'pending' as const,
      priority: 'medium' as const,
      hoursPerWeek: 40,
      allocatedHours: 35,
      utilization: 87.5,
      startDate: '2024-02-26',
      endDate: '2024-03-25',
      weeksRemaining: 4,
      billableRate: 85,
      projectValue: 11900,
      skills: ['Testing', 'Automation', 'Mobile'],
      manager: 'Sarah Johnson'
    },
    {
      id: 'ALL-2842',
      resource: 'Lisa Anderson',
      role: 'Junior Developer',
      project: 'Documentation Update',
      allocationType: 'contract' as const,
      status: 'cancelled' as const,
      priority: 'low' as const,
      hoursPerWeek: 40,
      allocatedHours: 20,
      utilization: 50,
      startDate: '2024-02-12',
      endDate: '2024-02-26',
      weeksRemaining: 0,
      billableRate: 65,
      projectValue: 0,
      skills: ['Documentation', 'Technical Writing'],
      manager: 'Michael Chen'
    }
  ]

  const projectAllocations = [
    {
      id: 'PROJ-8471',
      project: 'Product V2.0',
      totalHours: 520,
      allocatedResources: 8,
      budgetUsed: 62400,
      completion: 72
    },
    {
      id: 'PROJ-8470',
      project: 'Design System',
      totalHours: 280,
      allocatedResources: 4,
      budgetUsed: 30800,
      completion: 58
    },
    {
      id: 'PROJ-8469',
      project: 'Mobile App Beta',
      totalHours: 360,
      allocatedResources: 6,
      budgetUsed: 38880,
      completion: 84
    }
  ]

  const getStatusColor = (status: AllocationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getTypeColor = (type: AllocationType) => {
    switch (type) {
      case 'full-time': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'part-time': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'temporary': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'contract': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
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

  const filteredAllocations = viewMode === 'all'
    ? allocations
    : allocations.filter(allocation => allocation.status === viewMode)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

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
            <button className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all duration-300">
              New Allocation
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Allocations',
              value: '87',
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all projects'
            },
            {
              label: 'Total Hours',
              value: '3,480h',
              change: '+420h',
              trend: 'up' as const,
              subtitle: 'allocated this month'
            },
            {
              label: 'Resource Value',
              value: '$418K',
              change: '+52K',
              trend: 'up' as const,
              subtitle: 'billable allocation'
            },
            {
              label: 'Avg Utilization',
              value: '82%',
              change: '+4%',
              trend: 'up' as const,
              subtitle: 'efficiency rate'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Allocate', icon: '➕', onClick: () => {} },
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
                            {allocation.resource} → {allocation.project}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(allocation.status)}`}>
                            {allocation.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(allocation.allocationType)}`}>
                            {allocation.allocationType}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(allocation.priority)}`}>
                            {allocation.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-fuchsia-500">💼</span>
                            {allocation.role}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-fuchsia-500">👤</span>
                            Manager: {allocation.manager}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-fuchsia-500">📅</span>
                            {allocation.startDate} - {allocation.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                          {allocation.utilization}%
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
                          {allocation.allocatedHours}/{allocation.hoursPerWeek}h
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Weeks Left</div>
                        <div className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400">
                          {allocation.weeksRemaining}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Hourly Rate</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          ${allocation.billableRate}/hr
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Project Value</div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(allocation.projectValue)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Allocation: {allocation.utilization}%</span>
                        <span>{allocation.allocatedHours}/{allocation.hoursPerWeek} hours per week</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${allocation.utilization}%` }}
                        />
                      </div>
                    </div>

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
                  </div>
                ))}
              </div>
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
                    key={project.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-fuchsia-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors text-sm mb-2">
                      {project.project}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span>{project.totalHours}h total</span>
                      <span>{project.allocatedResources} resources</span>
                      <span className="col-span-2">{formatCurrency(project.budgetUsed)} budget</span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation Types */}
            <ProgressCard
              title="Allocation Types"
              items={[
                { label: 'Full-Time', value: 42, total: 87, color: 'purple' },
                { label: 'Part-Time', value: 28, total: 87, color: 'blue' },
                { label: 'Temporary', value: 12, total: 87, color: 'orange' },
                { label: 'Contract', value: 5, total: 87, color: 'cyan' }
              ]}
            />

            {/* Top Projects by Hours */}
            <RankingList
              title="Top Projects by Hours"
              items={[
                { label: 'Product V2.0', value: '520 hours', rank: 1, trend: 'up' },
                { label: 'Mobile App Beta', value: '360 hours', rank: 2, trend: 'same' },
                { label: 'Design System', value: '280 hours', rank: 3, trend: 'up' },
                { label: 'Infrastructure', value: '240 hours', rank: 4, trend: 'down' },
                { label: 'Marketing Site', value: '180 hours', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Allocation"
                value="32h/week"
                trend="up"
                change="+4h"
              />
              <MiniKPI
                label="Billable Rate"
                value="$108/h"
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
