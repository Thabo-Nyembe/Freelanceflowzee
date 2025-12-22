'use client'

import { useState } from 'react'
import { useOnboardingPrograms, useOnboardingTasks, useOnboardingMutations, OnboardingProgram, OnboardingTask, getProgramStatusColor, getTaskStatusColor, getTaskPriorityColor, getCompletionColor, calculateDaysRemaining } from '@/lib/hooks/use-onboarding'
import {
  UserPlus,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  Search,
  Mail,
  Laptop,
  BookOpen,
  Settings,
  BarChart3,
  AlertCircle
} from 'lucide-react'

interface OnboardingClientProps {
  initialPrograms: OnboardingProgram[]
  initialTasks: OnboardingTask[]
}

type ViewMode = 'all' | 'in-progress' | 'pending' | 'completed'

export default function OnboardingClient({ initialPrograms, initialTasks }: OnboardingClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { programs, stats, isLoading } = useOnboardingPrograms(initialPrograms, {
    status: viewMode === 'all' ? undefined : viewMode
  })
  const { tasks } = useOnboardingTasks(initialTasks)
  const { createProgram, isCreatingProgram } = useOnboardingMutations()

  const filteredPrograms = programs.filter(program =>
    program.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.onboarding_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800 border-green-200'
      case 'part-time': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contract': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'intern': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Employee Onboarding
            </h1>
            <p className="text-gray-600 mt-2">Manage new employee onboarding programs</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Onboarding Plan
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <UserPlus className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+6</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">Active Onboardings</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+5%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionRate.toFixed(0)}%</p>
            <p className="text-sm text-gray-500">Avg Completion Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">-12</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTasks - stats.tasksCompleted}</p>
            <p className="text-sm text-gray-500">Pending Tasks</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-green-600">-4 days</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgDaysToComplete.toFixed(0)}d</p>
            <p className="text-sm text-gray-500">Avg Time to Complete</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'New Onboarding', icon: Plus, color: 'from-green-500 to-emerald-500' },
              { label: 'View Schedule', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
              { label: 'Assign Buddy', icon: Users, color: 'from-purple-500 to-violet-500' },
              { label: 'Send Welcome', icon: Mail, color: 'from-yellow-500 to-orange-500' },
              { label: 'IT Setup', icon: Laptop, color: 'from-indigo-500 to-purple-500' },
              { label: 'Training', icon: BookOpen, color: 'from-teal-500 to-cyan-500' },
              { label: 'Reports', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
              { label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
            ].map((action) => (
              <button
                key={action.label}
                className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 mx-auto`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'in-progress', 'pending', 'completed'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'all' ? 'All Programs' : mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Onboarding Programs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Onboarding Programs</h2>
              <div className="text-sm text-gray-600">{filteredPrograms.length} programs</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading programs...</div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No onboarding programs found</div>
            ) : (
              <div className="space-y-3">
                {filteredPrograms.map((program) => {
                  const daysRemaining = calculateDaysRemaining(program.end_date)

                  return (
                    <div
                      key={program.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-green-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                            <UserPlus className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{program.employee_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{program.onboarding_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{program.role || 'New Employee'}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{program.department || 'General'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getProgramStatusColor(program.status)}`}>
                              {program.status}
                            </div>
                            <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getTypeColor(program.employee_type)}`}>
                              {program.employee_type}
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${getCompletionColor(Number(program.completion_rate))}`}>
                            {Number(program.completion_rate).toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Tasks Progress</div>
                          <div className="text-lg font-bold text-gray-900">
                            {program.tasks_completed}/{program.total_tasks}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Days Remaining</div>
                          <div className="text-lg font-bold text-yellow-600">
                            {program.days_remaining}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Buddy</div>
                          <div className="text-sm font-medium text-gray-900">
                            {program.buddy_name || 'Not assigned'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${program.welcome_email_sent ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-600">Welcome Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${program.equipment_provided ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-600">Equipment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${program.access_granted ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-gray-600">System Access</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{Number(program.completion_rate).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Number(program.completion_rate)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          {program.start_date && (
                            <span>Started: {new Date(program.start_date).toLocaleDateString()}</span>
                          )}
                          {program.manager_name && (
                            <span>Manager: {program.manager_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Tasks */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-gray-100 hover:border-green-200 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{task.task_name}</div>
                        <div className="text-xs text-gray-500 mt-1">{task.assigned_to || 'Unassigned'}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full border ${getTaskPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Summary */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Completion Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Total Programs</span>
                  <span className="font-semibold text-gray-900">{stats.total}</span>
                </div>
              </div>
            </div>

            {/* Task Progress */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Task Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.tasksCompleted}</span>
                  <span className="text-sm text-gray-500">of {stats.totalTasks} tasks</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${stats.totalTasks > 0 ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                <div className="text-xs text-gray-500">Satisfaction</div>
                <div className="text-xs text-green-600">+0.2</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">96%</div>
                <div className="text-xs text-gray-500">90d Retention</div>
                <div className="text-xs text-green-600">+3%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
