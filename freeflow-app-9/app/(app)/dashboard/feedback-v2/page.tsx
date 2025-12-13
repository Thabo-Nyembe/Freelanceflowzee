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
  MessageCircle, Star, ThumbsUp, TrendingUp, Plus,
  Send, Filter, CheckCircle, XCircle, Clock,
  Eye, Download, Upload, RefreshCw, Users
} from 'lucide-react'

type FeedbackStatus = 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'closed'
type FeedbackType = 'bug' | 'feature-request' | 'improvement' | 'praise' | 'complaint' | 'question'
type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'
type FeedbackSource = 'email' | 'in-app' | 'survey' | 'support-ticket' | 'social-media' | 'phone'

interface Feedback {
  id: string
  title: string
  content: string
  type: FeedbackType
  status: FeedbackStatus
  priority: FeedbackPriority
  source: FeedbackSource
  submittedBy: string
  submittedDate: string
  assignedTo?: string
  resolvedDate?: string
  rating?: number
  sentiment: 'positive' | 'neutral' | 'negative'
  upvotes: number
  category: string
  tags: string[]
}

const feedbackItems: Feedback[] = [
  {
    id: 'FDB-2847',
    title: 'Amazing new analytics dashboard!',
    content: 'The new analytics dashboard is incredible! The real-time insights and customizable widgets have transformed how we track our metrics. Thank you for this fantastic update!',
    type: 'praise',
    status: 'reviewed',
    priority: 'low',
    source: 'in-app',
    submittedBy: 'Sarah Johnson',
    submittedDate: '2024-01-12T14:30:00',
    rating: 5,
    sentiment: 'positive',
    upvotes: 47,
    category: 'Product',
    tags: ['Dashboard', 'Analytics', 'Positive', 'UX']
  },
  {
    id: 'FDB-2846',
    title: 'Add dark mode to mobile app',
    content: 'It would be great to have a dark mode option in the mobile app. I often use the app at night and the bright screen is difficult on the eyes.',
    type: 'feature-request',
    status: 'in-progress',
    priority: 'high',
    source: 'in-app',
    submittedBy: 'Michael Chen',
    submittedDate: '2024-01-11T10:15:00',
    assignedTo: 'Mobile Team',
    rating: 4,
    sentiment: 'neutral',
    upvotes: 234,
    category: 'Mobile',
    tags: ['Dark Mode', 'Mobile', 'Feature Request', 'UX']
  },
  {
    id: 'FDB-2845',
    title: 'Export function not working properly',
    content: 'When I try to export reports to PDF, the formatting is broken and images are not included. This is a critical issue for our monthly reporting.',
    type: 'bug',
    status: 'in-progress',
    priority: 'critical',
    source: 'support-ticket',
    submittedBy: 'Emily Rodriguez',
    submittedDate: '2024-01-10T16:45:00',
    assignedTo: 'Engineering Team',
    rating: 2,
    sentiment: 'negative',
    upvotes: 89,
    category: 'Reports',
    tags: ['Bug', 'Export', 'PDF', 'Critical']
  },
  {
    id: 'FDB-2844',
    title: 'Improve search functionality',
    content: 'The search feature could be enhanced with filters for date ranges, categories, and custom fields. This would help us find information much faster.',
    type: 'improvement',
    status: 'reviewed',
    priority: 'medium',
    source: 'email',
    submittedBy: 'David Kim',
    submittedDate: '2024-01-09T11:20:00',
    rating: 3,
    sentiment: 'neutral',
    upvotes: 156,
    category: 'Search',
    tags: ['Search', 'Improvement', 'Filters', 'UX']
  },
  {
    id: 'FDB-2843',
    title: 'How to integrate with Salesforce?',
    content: 'I am trying to set up the Salesforce integration but cannot find clear documentation. Can someone provide step-by-step instructions?',
    type: 'question',
    status: 'resolved',
    priority: 'medium',
    source: 'in-app',
    submittedBy: 'Lisa Anderson',
    submittedDate: '2024-01-08T09:30:00',
    assignedTo: 'Support Team',
    resolvedDate: '2024-01-08T14:00:00',
    sentiment: 'neutral',
    upvotes: 23,
    category: 'Integration',
    tags: ['Salesforce', 'Integration', 'Documentation', 'Question']
  },
  {
    id: 'FDB-2842',
    title: 'Billing issue - charged twice',
    content: 'I was charged twice for my monthly subscription on January 5th. This needs to be refunded immediately.',
    type: 'complaint',
    status: 'resolved',
    priority: 'high',
    source: 'email',
    submittedBy: 'Robert Martinez',
    submittedDate: '2024-01-06T13:15:00',
    assignedTo: 'Billing Team',
    resolvedDate: '2024-01-06T16:30:00',
    rating: 1,
    sentiment: 'negative',
    upvotes: 5,
    category: 'Billing',
    tags: ['Billing', 'Payment', 'Complaint', 'Refund']
  },
  {
    id: 'FDB-2841',
    title: 'Bulk edit feature for projects',
    content: 'It would save a lot of time if we could bulk edit project attributes instead of editing them one by one. Please consider adding this feature.',
    type: 'feature-request',
    status: 'new',
    priority: 'medium',
    source: 'survey',
    submittedBy: 'Jennifer Taylor',
    submittedDate: '2024-01-05T15:45:00',
    rating: 4,
    sentiment: 'positive',
    upvotes: 178,
    category: 'Projects',
    tags: ['Bulk Edit', 'Projects', 'Feature Request', 'Productivity']
  },
  {
    id: 'FDB-2840',
    title: 'Slow loading times on dashboard',
    content: 'The main dashboard has been loading very slowly over the past week (20-30 seconds). This is impacting our daily workflow.',
    type: 'bug',
    status: 'new',
    priority: 'high',
    source: 'social-media',
    submittedBy: 'Thomas Wright',
    submittedDate: '2024-01-04T10:00:00',
    rating: 2,
    sentiment: 'negative',
    upvotes: 67,
    category: 'Performance',
    tags: ['Performance', 'Bug', 'Dashboard', 'Loading Speed']
  }
]

const stats = [
  {
    label: 'Total Feedback',
    value: '8,947',
    change: 18.5,
    trend: 'up' as const,
    icon: MessageCircle
  },
  {
    label: 'Avg Rating',
    value: '4.2/5',
    change: 8.3,
    trend: 'up' as const,
    icon: Star
  },
  {
    label: 'Resolution Rate',
    value: '87.3%',
    change: 5.7,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Avg Response Time',
    value: '4.2 hrs',
    change: -12.5,
    trend: 'down' as const,
    icon: Clock
  }
]

const quickActions = [
  { label: 'Submit Feedback', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Review Feedback', icon: Eye, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Filter & Sort', icon: Filter, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Import Feedback', icon: Upload, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Assign to Team', icon: Users, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Send Response', icon: Send, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Feedback resolved', details: 'Billing issue - charged twice (FDB-2842)', time: '2 hours ago' },
  { action: 'New feedback', details: 'Dark mode feature request received', time: '1 day ago' },
  { action: 'Critical issue', details: 'Export function bug escalated', time: '2 days ago' },
  { action: 'High upvotes', details: 'Dark mode request reached 200+ upvotes', time: '2 days ago' },
  { action: 'Feedback closed', details: 'Salesforce integration question answered', time: '4 days ago' }
]

const topFeedback = [
  { name: 'Add dark mode to mobile app', metric: '234 upvotes' },
  { name: 'Bulk edit feature for projects', metric: '178 upvotes' },
  { name: 'Improve search functionality', metric: '156 upvotes' },
  { name: 'Export function not working', metric: '89 upvotes' },
  { name: 'Slow loading times', metric: '67 upvotes' }
]

export default function FeedbackV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'new' | 'in-progress' | 'resolved'>('all')

  const filteredFeedback = feedbackItems.filter(feedback => {
    if (viewMode === 'all') return true
    if (viewMode === 'new') return feedback.status === 'new'
    if (viewMode === 'in-progress') return feedback.status === 'in-progress'
    if (viewMode === 'resolved') return feedback.status === 'resolved'
    return true
  })

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'reviewed': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: FeedbackStatus) => {
    switch (status) {
      case 'new': return <Clock className="w-3 h-3" />
      case 'reviewed': return <Eye className="w-3 h-3" />
      case 'in-progress': return <RefreshCw className="w-3 h-3" />
      case 'resolved': return <CheckCircle className="w-3 h-3" />
      case 'closed': return <XCircle className="w-3 h-3" />
      default: return <MessageCircle className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: FeedbackType) => {
    switch (type) {
      case 'bug': return 'bg-red-50 text-red-600 border-red-100'
      case 'feature-request': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'improvement': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'praise': return 'bg-green-50 text-green-600 border-green-100'
      case 'complaint': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'question': return 'bg-cyan-50 text-cyan-600 border-cyan-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getPriorityColor = (priority: FeedbackPriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-50 text-gray-600 border-gray-100'
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'critical': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 text-green-600 border-green-100'
      case 'neutral': return 'bg-gray-50 text-gray-600 border-gray-100'
      case 'negative': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: FeedbackType) => {
    switch (type) {
      case 'bug': return 'from-red-500 to-orange-600'
      case 'feature-request': return 'from-blue-500 to-cyan-600'
      case 'improvement': return 'from-purple-500 to-pink-600'
      case 'praise': return 'from-green-500 to-emerald-600'
      case 'complaint': return 'from-orange-500 to-red-600'
      case 'question': return 'from-cyan-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Feedback
            </h1>
            <p className="text-gray-600 mt-2">Collect and manage user feedback and suggestions</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Submit Feedback
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
            label="All Feedback"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="New"
            isActive={viewMode === 'new'}
            onClick={() => setViewMode('new')}
          />
          <PillButton
            label="In Progress"
            isActive={viewMode === 'in-progress'}
            onClick={() => setViewMode('in-progress')}
          />
          <PillButton
            label="Resolved"
            isActive={viewMode === 'resolved'}
            onClick={() => setViewMode('resolved')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Feedback List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Feedback'}
              {viewMode === 'new' && 'New Feedback'}
              {viewMode === 'in-progress' && 'In Progress Feedback'}
              {viewMode === 'resolved' && 'Resolved Feedback'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredFeedback.length} total)
              </span>
            </h2>

            {filteredFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)} flex items-center gap-1`}>
                        {getStatusIcon(feedback.status)}
                        {feedback.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(feedback.type)}`}>
                        {feedback.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(feedback.sentiment)}`}>
                        {feedback.sentiment}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feedback.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {feedback.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {feedback.id} • By {feedback.submittedBy} via {feedback.source}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(feedback.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(feedback.submittedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{feedback.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Upvotes</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-blue-600" />
                      {feedback.upvotes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                    <p className="text-sm font-semibold text-gray-900">{feedback.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                {/* Rating */}
                {feedback.rating && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Rating</p>
                    <div className="flex gap-1">
                      {renderStars(feedback.rating)}
                    </div>
                  </div>
                )}

                {/* Resolution Date */}
                {feedback.resolvedDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Resolved on {formatDate(feedback.resolvedDate)}</span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feedback.tags.map((tag, index) => (
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

            {/* Feedback Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Feedback Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'feature-request', count: 3247, percentage: 36 },
                  { type: 'bug', count: 2156, percentage: 24 },
                  { type: 'improvement', count: 1678, percentage: 19 },
                  { type: 'question', count: 892, percentage: 10 },
                  { type: 'praise', count: 634, percentage: 7 },
                  { type: 'complaint', count: 340, percentage: 4 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 text-xs">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as FeedbackType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Feedback */}
            <RankingList
              title="Most Upvoted"
              items={topFeedback}
              gradient="from-orange-500 to-amber-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Satisfaction Score"
              value="4.2/5"
              change={8.3}
              trend="up"
            />

            <ProgressCard
              title="Monthly Target"
              current={247}
              target={300}
              label="feedback reviewed"
              gradient="from-orange-500 to-amber-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
