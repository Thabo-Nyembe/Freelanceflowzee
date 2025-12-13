"use client"

import { useState } from 'react'
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
  Search,
  Filter,
  BarChart3,
  Video,
  FileText,
  Zap,
  Activity
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TrainingStatus = 'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
type TrainingType = 'all' | 'onboarding' | 'skills' | 'compliance' | 'leadership' | 'technical'

export default function TrainingV2Page() {
  const [status, setStatus] = useState<TrainingStatus>('all')
  const [trainingType, setTrainingType] = useState<TrainingType>('all')

  const stats = [
    {
      label: 'Total Programs',
      value: '147',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Active Trainees',
      value: '2,847',
      change: '+24.7%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Completion Rate',
      value: '94.2%',
      change: '+12.4%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-purple-600'
    },
    {
      label: 'Avg Score',
      value: '87.4%',
      change: '+8.7%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Program',
      description: 'Create training program',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Schedule Session',
      description: 'Book training slot',
      icon: Calendar,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Upload Materials',
      description: 'Add training content',
      icon: FileText,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Progress Reports',
      description: 'View trainee analytics',
      icon: BarChart3,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Assign Training',
      description: 'Enroll employees',
      icon: Users,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Certificates',
      description: 'Issue credentials',
      icon: Award,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Quick Assess',
      description: 'Evaluate progress',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Export Data',
      description: 'Download reports',
      icon: Download,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const trainingPrograms = [
    {
      id: 'TRN-2847',
      name: 'New Employee Onboarding 2024',
      description: 'Comprehensive orientation program for new hires',
      type: 'onboarding',
      status: 'in-progress',
      trainer: 'Sarah Johnson',
      trainees: 47,
      capacity: 50,
      duration: 5,
      startDate: '2024-02-15',
      endDate: '2024-02-19',
      completionRate: 68.2,
      avgScore: 89.4,
      sessions: 10,
      location: 'Training Room A',
      format: 'In-Person'
    },
    {
      id: 'TRN-2846',
      name: 'Advanced Leadership Skills',
      description: 'Executive leadership and management training',
      type: 'leadership',
      status: 'scheduled',
      trainer: 'Michael Chen',
      trainees: 24,
      capacity: 30,
      duration: 3,
      startDate: '2024-02-20',
      endDate: '2024-02-22',
      completionRate: 0,
      avgScore: 0,
      sessions: 6,
      location: 'Executive Center',
      format: 'Hybrid'
    },
    {
      id: 'TRN-2845',
      name: 'Cybersecurity Awareness',
      description: 'Essential security practices and compliance training',
      type: 'compliance',
      status: 'completed',
      trainer: 'David Park',
      trainees: 284,
      capacity: 300,
      duration: 2,
      startDate: '2024-02-01',
      endDate: '2024-02-02',
      completionRate: 98.6,
      avgScore: 92.7,
      sessions: 4,
      location: 'Virtual',
      format: 'Online'
    },
    {
      id: 'TRN-2844',
      name: 'Python Programming Fundamentals',
      description: 'Introduction to Python for data analysis',
      type: 'technical',
      status: 'in-progress',
      trainer: 'Emma Wilson',
      trainees: 38,
      capacity: 40,
      duration: 10,
      startDate: '2024-02-10',
      endDate: '2024-02-21',
      completionRate: 45.8,
      avgScore: 84.2,
      sessions: 20,
      location: 'Tech Lab B',
      format: 'In-Person'
    },
    {
      id: 'TRN-2843',
      name: 'Customer Service Excellence',
      description: 'Advanced customer communication and problem-solving',
      type: 'skills',
      status: 'completed',
      trainer: 'Lisa Anderson',
      trainees: 124,
      capacity: 150,
      duration: 3,
      startDate: '2024-01-28',
      endDate: '2024-01-30',
      completionRate: 96.8,
      avgScore: 88.5,
      sessions: 6,
      location: 'Training Room C',
      format: 'In-Person'
    },
    {
      id: 'TRN-2842',
      name: 'Data Privacy & GDPR Compliance',
      description: 'Legal requirements and best practices',
      type: 'compliance',
      status: 'scheduled',
      trainer: 'Robert Taylor',
      trainees: 156,
      capacity: 200,
      duration: 1,
      startDate: '2024-02-25',
      endDate: '2024-02-25',
      completionRate: 0,
      avgScore: 0,
      sessions: 2,
      location: 'Virtual',
      format: 'Online'
    },
    {
      id: 'TRN-2841',
      name: 'Project Management Professional',
      description: 'PMP certification preparation course',
      type: 'skills',
      status: 'in-progress',
      trainer: 'James Martinez',
      trainees: 32,
      capacity: 35,
      duration: 15,
      startDate: '2024-02-05',
      endDate: '2024-02-23',
      completionRate: 62.4,
      avgScore: 86.9,
      sessions: 30,
      location: 'Training Room A',
      format: 'Hybrid'
    },
    {
      id: 'TRN-2840',
      name: 'Sales Techniques Masterclass',
      description: 'Advanced selling strategies and negotiation',
      type: 'skills',
      status: 'completed',
      trainer: 'Sarah Johnson',
      trainees: 84,
      capacity: 100,
      duration: 4,
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      completionRate: 94.2,
      avgScore: 90.8,
      sessions: 8,
      location: 'Conference Hall',
      format: 'In-Person'
    },
    {
      id: 'TRN-2839',
      name: 'Cloud Computing with AWS',
      description: 'AWS architecture and services training',
      type: 'technical',
      status: 'scheduled',
      trainer: 'Michael Chen',
      trainees: 28,
      capacity: 30,
      duration: 7,
      startDate: '2024-03-01',
      endDate: '2024-03-07',
      completionRate: 0,
      avgScore: 0,
      sessions: 14,
      location: 'Tech Lab A',
      format: 'Hybrid'
    },
    {
      id: 'TRN-2838',
      name: 'Workplace Safety & First Aid',
      description: 'Essential safety procedures and emergency response',
      type: 'compliance',
      status: 'cancelled',
      trainer: 'David Park',
      trainees: 0,
      capacity: 60,
      duration: 1,
      startDate: '2024-02-18',
      endDate: '2024-02-18',
      completionRate: 0,
      avgScore: 0,
      sessions: 2,
      location: 'Training Room B',
      format: 'In-Person'
    }
  ]

  const filteredPrograms = trainingPrograms.filter(program => {
    const statusMatch = status === 'all' || program.status === status
    const typeMatch = trainingType === 'all' || program.type === trainingType
    return statusMatch && typeMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Calendar,
          label: 'Scheduled'
        }
      case 'in-progress':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Activity,
          label: 'In Progress'
        }
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Completed'
        }
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'Cancelled'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Target,
          label: status
        }
    }
  }

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'In-Person':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Online':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Hybrid':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCapacityColor = (trainees: number, capacity: number) => {
    const percentage = (trainees / capacity) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const recentActivity = [
    { label: 'Training completed', time: '2 hours ago', color: 'text-green-600' },
    { label: 'New program scheduled', time: '5 hours ago', color: 'text-blue-600' },
    { label: 'Certificate issued', time: '1 day ago', color: 'text-purple-600' },
    { label: 'Materials uploaded', time: '2 days ago', color: 'text-orange-600' },
    { label: 'Trainees enrolled', time: '3 days ago', color: 'text-cyan-600' }
  ]

  const topProgramsByTrainees = [
    { label: 'Cybersecurity Awareness', value: '284 trainees', color: 'bg-blue-500' },
    { label: 'GDPR Compliance', value: '156 trainees', color: 'bg-green-500' },
    { label: 'Customer Service', value: '124 trainees', color: 'bg-purple-500' },
    { label: 'Sales Techniques', value: '84 trainees', color: 'bg-orange-500' },
    { label: 'New Employee Onboarding', value: '47 trainees', color: 'bg-cyan-500' }
  ]

  const overallCompletionData = {
    label: 'Overall Completion Rate',
    current: 94.2,
    target: 95,
    subtitle: 'Across all programs'
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
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Programs
                </PillButton>
                <PillButton
                  onClick={() => setStatus('scheduled')}
                  isActive={status === 'scheduled'}
                  variant="default"
                >
                  Scheduled
                </PillButton>
                <PillButton
                  onClick={() => setStatus('in-progress')}
                  isActive={status === 'in-progress'}
                  variant="default"
                >
                  In Progress
                </PillButton>
                <PillButton
                  onClick={() => setStatus('completed')}
                  isActive={status === 'completed'}
                  variant="default"
                >
                  Completed
                </PillButton>
                <PillButton
                  onClick={() => setStatus('cancelled')}
                  isActive={status === 'cancelled'}
                  variant="default"
                >
                  Cancelled
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setTrainingType('all')}
                  isActive={trainingType === 'all'}
                  variant="default"
                >
                  All Types
                </PillButton>
                <PillButton
                  onClick={() => setTrainingType('onboarding')}
                  isActive={trainingType === 'onboarding'}
                  variant="default"
                >
                  Onboarding
                </PillButton>
                <PillButton
                  onClick={() => setTrainingType('skills')}
                  isActive={trainingType === 'skills'}
                  variant="default"
                >
                  Skills
                </PillButton>
                <PillButton
                  onClick={() => setTrainingType('compliance')}
                  isActive={trainingType === 'compliance'}
                  variant="default"
                >
                  Compliance
                </PillButton>
                <PillButton
                  onClick={() => setTrainingType('leadership')}
                  isActive={trainingType === 'leadership'}
                  variant="default"
                >
                  Leadership
                </PillButton>
                <PillButton
                  onClick={() => setTrainingType('technical')}
                  isActive={trainingType === 'technical'}
                  variant="default"
                >
                  Technical
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Programs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Training Schedule</h2>
              <div className="text-sm text-gray-600">
                {filteredPrograms.length} programs
              </div>
            </div>

            <div className="space-y-3">
              {filteredPrograms.map((program) => {
                const statusBadge = getStatusBadge(program.status)
                const StatusIcon = statusBadge.icon
                const capacityPercentage = (program.trainees / program.capacity) * 100

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
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{program.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{program.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{program.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getFormatBadge(program.format)}`}>
                          {program.format}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{program.description}</p>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Trainees</div>
                        <div className={`font-semibold text-lg ${getCapacityColor(program.trainees, program.capacity)}`}>
                          {program.trainees}/{program.capacity}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Duration</div>
                        <div className="font-medium text-gray-900">{program.duration} days</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Sessions</div>
                        <div className="font-medium text-gray-900">{program.sessions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="font-medium text-gray-900 text-sm">{program.location}</div>
                      </div>
                    </div>

                    {program.status === 'in-progress' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{program.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                            style={{ width: `${program.completionRate}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Trainer: <span className="font-medium text-gray-900">{program.trainer}</span>
                        </span>
                        {program.avgScore > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              Avg Score: <span className="font-medium text-green-600">{program.avgScore.toFixed(1)}%</span>
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {program.startDate} - {program.endDate}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={overallCompletionData.label}
              current={overallCompletionData.current}
              target={overallCompletionData.target}
              subtitle={overallCompletionData.subtitle}
            />

            <MiniKPI
              title="Active Trainees"
              value="2,847"
              change="+24.7%"
              trend="up"
              subtitle="Currently enrolled"
            />

            <RankingList
              title="Most Popular"
              items={topProgramsByTrainees}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
