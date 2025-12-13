"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  ClipboardList, Users, BarChart3, TrendingUp, Plus,
  Send, Calendar, CheckCircle, XCircle, Clock,
  Eye, Download, Upload, RefreshCw, Star
} from 'lucide-react'

type SurveyStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'
type SurveyType = 'nps' | 'csat' | 'customer-feedback' | 'employee-engagement' | 'market-research' | 'product-feedback'

interface Survey {
  id: string
  title: string
  description: string
  type: SurveyType
  status: SurveyStatus
  createdBy: string
  createdDate: string
  publishedDate?: string
  closedDate?: string
  totalQuestions: number
  totalResponses: number
  targetResponses: number
  completionRate: number
  averageTime: number
  npsScore?: number
  csatScore?: number
  sentTo: number
  tags: string[]
}

const surveys: Survey[] = [
  {
    id: 'SUR-2847',
    title: 'Q1 2024 Customer Satisfaction Survey',
    description: 'Measure overall customer satisfaction with our products and services for Q1 2024',
    type: 'csat',
    status: 'active',
    createdBy: 'Sarah Johnson',
    createdDate: '2024-01-05T09:00:00',
    publishedDate: '2024-01-08T10:00:00',
    totalQuestions: 15,
    totalResponses: 2847,
    targetResponses: 5000,
    completionRate: 78.5,
    averageTime: 4.2,
    csatScore: 8.4,
    sentTo: 12456,
    tags: ['Customer', 'CSAT', 'Q1', 'Satisfaction']
  },
  {
    id: 'SUR-2846',
    title: 'Product Launch Feedback: Analytics Platform',
    description: 'Gather user feedback on the newly launched analytics platform features',
    type: 'product-feedback',
    status: 'active',
    createdBy: 'Product Team',
    createdDate: '2024-01-10T14:00:00',
    publishedDate: '2024-01-12T09:00:00',
    totalQuestions: 12,
    totalResponses: 1456,
    targetResponses: 3000,
    completionRate: 82.3,
    averageTime: 5.8,
    sentTo: 4567,
    tags: ['Product', 'Launch', 'Analytics', 'Feedback']
  },
  {
    id: 'SUR-2845',
    title: 'Net Promoter Score - January 2024',
    description: 'Monthly NPS survey to measure customer loyalty and likelihood to recommend',
    type: 'nps',
    status: 'active',
    createdBy: 'Customer Success',
    createdDate: '2024-01-01T08:00:00',
    publishedDate: '2024-01-03T09:00:00',
    totalQuestions: 3,
    totalResponses: 4289,
    targetResponses: 5000,
    completionRate: 91.7,
    averageTime: 1.5,
    npsScore: 67,
    sentTo: 8934,
    tags: ['NPS', 'Monthly', 'Loyalty', 'January']
  },
  {
    id: 'SUR-2844',
    title: 'Employee Engagement Survey - Annual 2024',
    description: 'Annual comprehensive survey to measure employee satisfaction, engagement, and workplace culture',
    type: 'employee-engagement',
    status: 'closed',
    createdBy: 'HR Department',
    createdDate: '2023-12-15T10:00:00',
    publishedDate: '2024-01-02T08:00:00',
    closedDate: '2024-01-10T23:59:59',
    totalQuestions: 45,
    totalResponses: 847,
    targetResponses: 892,
    completionRate: 95.2,
    averageTime: 18.6,
    sentTo: 892,
    tags: ['Employee', 'Engagement', 'Annual', 'HR']
  },
  {
    id: 'SUR-2843',
    title: 'Market Research: Enterprise Software Needs',
    description: 'Research survey targeting enterprise decision-makers about software requirements',
    type: 'market-research',
    status: 'paused',
    createdBy: 'Research Team',
    createdDate: '2023-12-20T11:00:00',
    publishedDate: '2024-01-05T10:00:00',
    totalQuestions: 28,
    totalResponses: 567,
    targetResponses: 2000,
    completionRate: 65.4,
    averageTime: 12.3,
    sentTo: 3456,
    tags: ['Market Research', 'Enterprise', 'B2B']
  },
  {
    id: 'SUR-2842',
    title: 'Customer Support Experience Survey',
    description: 'Evaluate customer satisfaction with support interactions and resolution quality',
    type: 'customer-feedback',
    status: 'active',
    createdBy: 'Support Team',
    createdDate: '2024-01-07T09:00:00',
    publishedDate: '2024-01-08T10:00:00',
    totalQuestions: 10,
    totalResponses: 3156,
    targetResponses: 4000,
    completionRate: 88.9,
    averageTime: 3.4,
    csatScore: 9.1,
    sentTo: 5678,
    tags: ['Support', 'Customer Service', 'Experience']
  },
  {
    id: 'SUR-2841',
    title: 'Website Usability Assessment',
    description: 'Gather feedback on website navigation, design, and overall user experience',
    type: 'product-feedback',
    status: 'closed',
    createdBy: 'UX Team',
    createdDate: '2023-12-10T14:00:00',
    publishedDate: '2023-12-15T09:00:00',
    closedDate: '2024-01-05T23:59:59',
    totalQuestions: 18,
    totalResponses: 1847,
    targetResponses: 2000,
    completionRate: 73.6,
    averageTime: 6.7,
    sentTo: 4289,
    tags: ['Website', 'UX', 'Usability', 'Design']
  },
  {
    id: 'SUR-2840',
    title: 'Pricing & Packaging Feedback',
    description: 'Understand customer perception of pricing tiers and feature packaging',
    type: 'customer-feedback',
    status: 'draft',
    createdBy: 'Pricing Team',
    createdDate: '2024-01-11T15:00:00',
    totalQuestions: 14,
    totalResponses: 0,
    targetResponses: 1500,
    completionRate: 0,
    averageTime: 0,
    sentTo: 0,
    tags: ['Pricing', 'Packaging', 'Revenue', 'Strategy']
  }
]

const stats = [
  {
    label: 'Total Surveys',
    value: '247',
    change: 15.3,
    trend: 'up' as const,
    icon: ClipboardList
  },
  {
    label: 'Total Responses',
    value: '42.5K',
    change: 28.7,
    trend: 'up' as const,
    icon: Users
  },
  {
    label: 'Avg Completion',
    value: '82.1%',
    change: 6.4,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Avg NPS Score',
    value: '67',
    change: 8.2,
    trend: 'up' as const,
    icon: Star
  }
]

const quickActions = [
  { label: 'Create Survey', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Publish Survey', icon: Send, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Schedule Survey', icon: Calendar, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'View Analytics', icon: BarChart3, gradient: 'from-orange-500 to-red-600' },
  { label: 'Export Responses', icon: Download, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Import Questions', icon: Upload, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Manage Templates', icon: ClipboardList, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Survey published', details: 'Product Launch Feedback survey activated', time: '1 hour ago' },
  { action: 'Target reached', details: 'Employee Engagement survey completed', time: '2 days ago' },
  { action: 'High response rate', details: 'NPS survey achieved 91.7% completion', time: '3 days ago' },
  { action: 'Survey paused', details: 'Market Research survey temporarily paused', time: '4 days ago' },
  { action: 'Survey closed', details: 'Website Usability survey ended', time: '1 week ago' }
]

const topSurveys = [
  { name: 'Employee Engagement - Annual', metric: '95.2% completion' },
  { name: 'Net Promoter Score - January', metric: '91.7% completion' },
  { name: 'Customer Support Experience', metric: '88.9% completion' },
  { name: 'Product Launch Feedback', metric: '82.3% completion' },
  { name: 'Q1 Customer Satisfaction', metric: '78.5% completion' }
]

export default function SurveysV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'closed' | 'draft'>('all')

  const filteredSurveys = surveys.filter(survey => {
    if (viewMode === 'all') return true
    if (viewMode === 'active') return survey.status === 'active'
    if (viewMode === 'closed') return survey.status === 'closed'
    if (viewMode === 'draft') return survey.status === 'draft'
    return true
  })

  const getStatusColor = (status: SurveyStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'closed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'archived': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: SurveyStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'paused': return <Clock className="w-3 h-3" />
      case 'closed': return <XCircle className="w-3 h-3" />
      case 'archived': return <XCircle className="w-3 h-3" />
      default: return <ClipboardList className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: SurveyType) => {
    switch (type) {
      case 'nps': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'csat': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'customer-feedback': return 'bg-green-50 text-green-600 border-green-100'
      case 'employee-engagement': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'market-research': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'product-feedback': return 'bg-pink-50 text-pink-600 border-pink-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: SurveyType) => {
    switch (type) {
      case 'nps': return 'from-blue-500 to-cyan-600'
      case 'csat': return 'from-purple-500 to-pink-600'
      case 'customer-feedback': return 'from-green-500 to-emerald-600'
      case 'employee-engagement': return 'from-indigo-500 to-purple-600'
      case 'market-research': return 'from-orange-500 to-red-600'
      case 'product-feedback': return 'from-pink-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateResponseRate = (responses: number, sent: number) => {
    if (sent === 0) return 0
    return Math.round((responses / sent) * 100)
  }

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.round((current / target) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Surveys
            </h1>
            <p className="text-gray-600 mt-2">Gather insights and feedback from your audience</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Survey
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Surveys"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Closed"
            isActive={viewMode === 'closed'}
            onClick={() => setViewMode('closed')}
          />
          <PillButton
            label="Drafts"
            isActive={viewMode === 'draft'}
            onClick={() => setViewMode('draft')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Surveys List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Surveys'}
              {viewMode === 'active' && 'Active Surveys'}
              {viewMode === 'closed' && 'Closed Surveys'}
              {viewMode === 'draft' && 'Draft Surveys'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredSurveys.length} total)
              </span>
            </h2>

            {filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)} flex items-center gap-1`}>
                        {getStatusIcon(survey.status)}
                        {survey.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(survey.type)}`}>
                        {survey.type}
                      </span>
                      {survey.npsScore && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          NPS: {survey.npsScore}
                        </span>
                      )}
                      {survey.csatScore && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-600 border-purple-100 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          CSAT: {survey.csatScore}/10
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {survey.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {survey.id} • Created by {survey.createdBy} • {formatDate(survey.createdDate)}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(survey.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Questions</p>
                    <p className="text-sm font-semibold text-gray-900">{survey.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Responses</p>
                    <p className="text-sm font-semibold text-gray-900">{survey.totalResponses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Completion</p>
                    <p className="text-sm font-semibold text-gray-900">{survey.completionRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                    <p className="text-sm font-semibold text-gray-900">{survey.averageTime} min</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-4">
                  {survey.status !== 'draft' && (
                    <>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Response Progress</span>
                          <span>{survey.totalResponses.toLocaleString()} / {survey.targetResponses.toLocaleString()} ({calculateProgress(survey.totalResponses, survey.targetResponses)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getTypeGradient(survey.type)} rounded-full transition-all`}
                            style={{ width: `${Math.min(calculateProgress(survey.totalResponses, survey.targetResponses), 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Completion Rate</span>
                          <span>{survey.completionRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                            style={{ width: `${survey.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {survey.sentTo > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Response Rate</span>
                            <span>{calculateResponseRate(survey.totalResponses, survey.sentTo)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all"
                              style={{ width: `${calculateResponseRate(survey.totalResponses, survey.sentTo)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Survey Dates */}
                {survey.status !== 'draft' && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    {survey.publishedDate && (
                      <div className="flex items-center gap-1">
                        <Send className="w-4 h-4 text-green-600" />
                        <span>Published: {formatDate(survey.publishedDate)}</span>
                      </div>
                    )}
                    {survey.closedDate && (
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Closed: {formatDate(survey.closedDate)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {survey.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Survey Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Survey Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'customer-feedback', count: 78, percentage: 32 },
                  { type: 'product-feedback', count: 62, percentage: 25 },
                  { type: 'nps', count: 45, percentage: 18 },
                  { type: 'csat', count: 34, percentage: 14 },
                  { type: 'employee-engagement', count: 18, percentage: 7 },
                  { type: 'market-research', count: 10, percentage: 4 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 text-xs">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as SurveyType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Surveys */}
            <RankingList
              title="Best Performers"
              items={topSurveys}
              gradient="from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Response Time"
              value="6.8 min"
              change={-12.5}
              trend="down"
            />

            <ProgressCard
              title="Monthly Target"
              current={18}
              target={25}
              label="surveys published"
              gradient="from-green-500 to-emerald-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
