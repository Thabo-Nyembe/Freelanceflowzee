'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type OnboardingStatus = 'pending' | 'in-progress' | 'completed' | 'paused'
type TaskStatus = 'pending' | 'completed' | 'overdue' | 'skipped'
type EmployeeType = 'full-time' | 'part-time' | 'contract' | 'intern'
type ViewMode = 'all' | 'in-progress' | 'pending' | 'completed'

export default function OnboardingV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample onboarding data
  const onboardingPrograms = [
    {
      id: 'ONB-2847',
      employee: 'Sarah Johnson',
      role: 'Senior Full Stack Developer',
      department: 'Engineering',
      type: 'full-time' as const,
      status: 'in-progress' as const,
      startDate: '2024-02-15',
      completionRate: 68,
      tasksCompleted: 34,
      totalTasks: 50,
      daysRemaining: 12,
      buddy: 'Michael Chen',
      manager: 'Emily Rodriguez'
    },
    {
      id: 'ONB-2846',
      employee: 'David Kim',
      role: 'Product Manager',
      department: 'Product',
      type: 'full-time' as const,
      status: 'in-progress' as const,
      startDate: '2024-02-10',
      completionRate: 82,
      tasksCompleted: 41,
      totalTasks: 50,
      daysRemaining: 7,
      buddy: 'Jessica Williams',
      manager: 'Robert Brown'
    },
    {
      id: 'ONB-2845',
      employee: 'Emily Martinez',
      role: 'UX Designer',
      department: 'Design',
      type: 'full-time' as const,
      status: 'completed' as const,
      startDate: '2024-01-20',
      completionRate: 100,
      tasksCompleted: 50,
      totalTasks: 50,
      daysRemaining: 0,
      buddy: 'Amanda Lee',
      manager: 'Chris Anderson'
    },
    {
      id: 'ONB-2844',
      employee: 'James Wilson',
      role: 'Marketing Intern',
      department: 'Marketing',
      type: 'intern' as const,
      status: 'pending' as const,
      startDate: '2024-02-20',
      completionRate: 0,
      tasksCompleted: 0,
      totalTasks: 35,
      daysRemaining: 30,
      buddy: 'Sarah Thompson',
      manager: 'Michelle Davis'
    },
    {
      id: 'ONB-2843',
      employee: 'Lisa Anderson',
      role: 'DevOps Engineer',
      department: 'Engineering',
      type: 'contract' as const,
      status: 'in-progress' as const,
      startDate: '2024-02-12',
      completionRate: 54,
      tasksCompleted: 27,
      totalTasks: 50,
      daysRemaining: 15,
      buddy: 'Kevin Zhang',
      manager: 'Emily Rodriguez'
    },
    {
      id: 'ONB-2842',
      employee: 'Michael Taylor',
      role: 'Sales Representative',
      department: 'Sales',
      type: 'full-time' as const,
      status: 'paused' as const,
      startDate: '2024-02-05',
      completionRate: 42,
      tasksCompleted: 21,
      totalTasks: 50,
      daysRemaining: 18,
      buddy: 'Rachel Green',
      manager: 'Tom Wilson'
    }
  ]

  const onboardingTasks = [
    {
      id: 'TASK-8471',
      category: 'Documentation',
      name: 'Complete Employment Forms',
      employee: 'Sarah Johnson',
      status: 'completed' as const,
      dueDate: '2024-02-16',
      priority: 'high'
    },
    {
      id: 'TASK-8470',
      category: 'IT Setup',
      name: 'Configure Development Environment',
      employee: 'Sarah Johnson',
      status: 'completed' as const,
      dueDate: '2024-02-17',
      priority: 'high'
    },
    {
      id: 'TASK-8469',
      category: 'Training',
      name: 'Complete Security Training',
      employee: 'David Kim',
      status: 'completed' as const,
      dueDate: '2024-02-15',
      priority: 'critical'
    },
    {
      id: 'TASK-8468',
      category: 'Meetings',
      name: 'Team Introduction Session',
      employee: 'Sarah Johnson',
      status: 'pending' as const,
      dueDate: '2024-02-19',
      priority: 'medium'
    },
    {
      id: 'TASK-8467',
      category: 'Training',
      name: 'Product Knowledge Workshop',
      employee: 'David Kim',
      status: 'overdue' as const,
      dueDate: '2024-02-14',
      priority: 'high'
    }
  ]

  const getStatusColor = (status: OnboardingStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'paused': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  }

  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'skipped': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getTypeColor = (type: EmployeeType) => {
    switch (type) {
      case 'full-time': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'part-time': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'contract': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'intern': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    }
  }

  const filteredPrograms = viewMode === 'all'
    ? onboardingPrograms
    : onboardingPrograms.filter(program => program.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-green-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Employee Onboarding
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage new employee onboarding programs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300">
              Create Onboarding Plan
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Onboardings',
              value: '24',
              change: '+6',
              trend: 'up' as const,
              subtitle: 'in progress this month'
            },
            {
              label: 'Avg Completion Rate',
              value: '89%',
              change: '+5%',
              trend: 'up' as const,
              subtitle: 'across all programs'
            },
            {
              label: 'Pending Tasks',
              value: '147',
              change: '-12',
              trend: 'up' as const,
              subtitle: 'down from last week'
            },
            {
              label: 'Avg Time to Complete',
              value: '28 days',
              change: '-4 days',
              trend: 'up' as const,
              subtitle: 'improving efficiency'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Onboarding', icon: '➕', onClick: () => {} },
            { label: 'View Schedule', icon: '📅', onClick: () => {} },
            { label: 'Assign Buddy', icon: '👥', onClick: () => {} },
            { label: 'Send Welcome Email', icon: '✉️', onClick: () => {} },
            { label: 'IT Setup', icon: '💻', onClick: () => {} },
            { label: 'Training Materials', icon: '📚', onClick: () => {} },
            { label: 'Reports', icon: '📊', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Programs"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="In Progress"
            isActive={viewMode === 'in-progress'}
            onClick={() => setViewMode('in-progress')}
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

          {/* Onboarding Programs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Onboarding Programs ({filteredPrograms.length})
              </h2>
              <div className="space-y-3">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {program.employee}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(program.status)}`}>
                            {program.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(program.type)}`}>
                            {program.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-green-500">💼</span>
                            {program.role}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-green-500">🏢</span>
                            {program.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-green-500">📅</span>
                            Started: {program.startDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {program.completionRate}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Complete
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Tasks Progress</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {program.tasksCompleted}/{program.totalTasks}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Days Remaining</div>
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {program.daysRemaining}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Buddy</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {program.buddy}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{program.completionRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${program.completionRate}%` }}
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

            {/* Recent Tasks */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Tasks</h3>
              <div className="space-y-3">
                {onboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-green-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-sm">
                          {task.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {task.employee}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">{task.category}</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion by Phase */}
            <ProgressCard
              title="Completion by Phase"
              items={[
                { label: 'Pre-boarding', value: 847, total: 1000, color: 'blue' },
                { label: 'Week 1 - Orientation', value: 924, total: 1000, color: 'green' },
                { label: 'Week 2-4 - Training', value: 682, total: 1000, color: 'yellow' },
                { label: 'Month 2 - Integration', value: 447, total: 1000, color: 'orange' },
                { label: 'Month 3 - Review', value: 284, total: 1000, color: 'purple' }
              ]}
            />

            {/* Top Departments Onboarding */}
            <RankingList
              title="Top Departments Onboarding"
              items={[
                { label: 'Engineering', value: '12 employees', rank: 1, trend: 'up' },
                { label: 'Product', value: '8 employees', rank: 2, trend: 'up' },
                { label: 'Marketing', value: '6 employees', rank: 3, trend: 'same' },
                { label: 'Sales', value: '4 employees', rank: 4, trend: 'down' },
                { label: 'Design', value: '3 employees', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Satisfaction"
                value="4.8/5"
                trend="up"
                change="+0.2"
              />
              <MiniKPI
                label="Retention (90d)"
                value="96%"
                trend="up"
                change="+3%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Onboarding completed',
                  subject: 'Emily Martinez - UX Designer',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Task completed',
                  subject: 'Sarah Johnson - Security Training',
                  time: '3 hours ago',
                  type: 'success'
                },
                {
                  action: 'Buddy assigned',
                  subject: 'James Wilson - Sarah Thompson',
                  time: '5 hours ago',
                  type: 'info'
                },
                {
                  action: 'Task overdue',
                  subject: 'David Kim - Product Workshop',
                  time: '1 day ago',
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
