'use client'

import { useState } from 'react'
import { useTrainingPrograms, useTrainingMutations, TrainingProgram } from '@/lib/hooks/use-training'
import {
  Target,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Download,
  Plus,
  Activity
} from 'lucide-react'

interface TrainingClientProps {
  initialPrograms: TrainingProgram[]
}

type TrainingStatus = 'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
type TrainingType = 'all' | 'onboarding' | 'skills' | 'compliance' | 'leadership' | 'technical'

export default function TrainingClient({ initialPrograms }: TrainingClientProps) {
  const [status, setStatus] = useState<TrainingStatus>('all')
  const [trainingType, setTrainingType] = useState<TrainingType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { programs, stats, isLoading } = useTrainingPrograms(initialPrograms, {
    status: status === 'all' ? undefined : status,
    programType: trainingType === 'all' ? undefined : trainingType
  })
  const { createProgram, isCreating } = useTrainingMutations()

  const filteredPrograms = programs.filter(program =>
    program.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.trainer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.program_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar, label: 'Scheduled' }
      case 'in-progress':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity, label: 'In Progress' }
      case 'completed':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Completed' }
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'Cancelled' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Target, label: s }
    }
  }

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'in-person': return 'bg-green-100 text-green-800 border-green-200'
      case 'online': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'hybrid': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCapacityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Training Programs
            </h1>
            <p className="text-gray-600 mt-2">Manage employee training and development</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Program
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Programs</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+24.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTrainees.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Active Trainees</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+12.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Completion Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-green-600">+8.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Avg Score</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'scheduled', 'in-progress', 'completed', 'cancelled'] as TrainingStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Programs' : s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'onboarding', 'skills', 'compliance', 'leadership', 'technical'] as TrainingType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrainingType(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      trainingType === t
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Training Schedule</h2>
              <div className="text-sm text-gray-600">{filteredPrograms.length} programs</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading programs...</div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No programs found</div>
            ) : (
              <div className="space-y-3">
                {filteredPrograms.map((program) => {
                  const statusBadge = getStatusBadge(program.status)
                  const StatusIcon = statusBadge.icon

                  return (
                    <div
                      key={program.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-green-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                            <Target className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{program.program_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{program.program_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500 capitalize">{program.program_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getFormatBadge(program.format)}`}>
                            {program.format.replace('-', ' ')}
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{program.description || 'No description'}</p>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Trainees</div>
                          <div className={`font-semibold text-lg ${getCapacityColor(program.enrolled_count, program.max_capacity)}`}>
                            {program.enrolled_count}/{program.max_capacity}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Duration</div>
                          <div className="font-medium text-gray-900">{program.duration_days} days</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Sessions</div>
                          <div className="font-medium text-gray-900">{program.session_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Location</div>
                          <div className="font-medium text-gray-900 text-sm">{program.location || 'TBD'}</div>
                        </div>
                      </div>

                      {program.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">{Number(program.completion_rate).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                              style={{ width: `${program.completion_rate}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            Trainer: <span className="font-medium text-gray-900">{program.trainer_name || 'Unassigned'}</span>
                          </span>
                          {program.avg_score > 0 && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">
                                Avg Score: <span className="font-medium text-green-600">{Number(program.avg_score).toFixed(1)}%</span>
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-gray-500">
                          {program.start_date ? new Date(program.start_date).toLocaleDateString() : 'TBD'} - {program.end_date ? new Date(program.end_date).toLocaleDateString() : 'TBD'}
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
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Overall Completion Rate</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.avgCompletionRate.toFixed(1)}%</span>
                  <span className="text-sm text-gray-500">of 95% target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${Math.min(stats.avgCompletionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Program Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled</span>
                  <span className="font-semibold text-blue-600">{stats.scheduled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-purple-600">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Trainees</span>
                  <span className="font-semibold">{stats.totalTrainees.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
