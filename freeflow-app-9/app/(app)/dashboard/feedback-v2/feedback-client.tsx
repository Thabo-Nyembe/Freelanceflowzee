// Feedback V2 - Client Component with Real-time Data
// Created: December 14, 2024

'use client'

import { useState } from 'react'
import { useFeedback, type Feedback, type FeedbackStatus, type FeedbackType, type FeedbackPriority } from '@/lib/hooks/use-feedback'

interface FeedbackClientProps {
  initialFeedback: Feedback[]
}

export default function FeedbackClient({ initialFeedback }: FeedbackClientProps) {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriority | 'all'>('all')

  const { feedback, loading, error } = useFeedback({
    status: statusFilter,
    feedbackType: typeFilter,
    priority: priorityFilter,
    limit: 50
  })

  const displayFeedback = feedback.length > 0 ? feedback : initialFeedback

  // Filter client-side for better UX
  const filteredFeedback = displayFeedback.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (typeFilter !== 'all' && item.feedback_type !== typeFilter) return false
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayFeedback.length,
    byStatus: displayFeedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: displayFeedback.reduce((acc, item) => {
      acc[item.feedback_type] = (acc[item.feedback_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byPriority: displayFeedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    avgRating: displayFeedback.filter(item => item.rating).reduce((acc, item) => acc + (item.rating || 0), 0) / displayFeedback.filter(item => item.rating).length || 0
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: FeedbackStatus) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-700',
      'reviewing': 'bg-purple-100 text-purple-700',
      'planned': 'bg-indigo-100 text-indigo-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'declined': 'bg-red-100 text-red-700',
      'duplicate': 'bg-gray-100 text-gray-700',
      'archived': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: FeedbackType) => {
    const colors = {
      'bug': 'bg-red-50 text-red-600',
      'feature-request': 'bg-blue-50 text-blue-600',
      'improvement': 'bg-purple-50 text-purple-600',
      'complaint': 'bg-orange-50 text-orange-600',
      'praise': 'bg-green-50 text-green-600',
      'question': 'bg-cyan-50 text-cyan-600',
      'general': 'bg-gray-50 text-gray-600',
      'other': 'bg-gray-50 text-gray-600'
    }
    return colors[type] || 'bg-gray-50 text-gray-600'
  }

  const getPriorityColor = (priority: FeedbackPriority) => {
    const colors = {
      'low': 'bg-gray-50 text-gray-600',
      'medium': 'bg-blue-50 text-blue-600',
      'high': 'bg-orange-50 text-orange-600',
      'critical': 'bg-red-50 text-red-600'
    }
    return colors[priority] || 'bg-gray-50 text-gray-600'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading feedback: {error.message}
          </div>
        </div>
      </div>
    )
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
          <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all">
            + Submit Feedback
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Feedback</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-green-600 mt-1">↑ Real-time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">New</div>
            <div className="text-3xl font-bold text-blue-600">{stats.byStatus.new || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting review</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.byStatus['in-progress'] || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Being worked on</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Avg Rating</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Out of 5</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
                <option value="duplicate">Duplicate</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FeedbackType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="bug">Bug</option>
                <option value="feature-request">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="complaint">Complaint</option>
                <option value="praise">Praise</option>
                <option value="question">Question</option>
                <option value="general">General</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as FeedbackPriority | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading feedback...</p>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Feedback Items ({filteredFeedback.length})
            </h2>
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No feedback found</h3>
              <p className="text-gray-600">Submit feedback to get started!</p>
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.feedback_type)}`}>
                        {item.feedback_type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      {item.sentiment && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.sentiment === 'positive' ? 'bg-green-50 text-green-600' :
                          item.sentiment === 'negative' ? 'bg-red-50 text-red-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {item.sentiment}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {item.submitted_by_name && (
                        <span>By: {item.submitted_by_name}</span>
                      )}
                      {item.submitted_by_email && (
                        <span>Email: {item.submitted_by_email}</span>
                      )}
                      <span>Created: {formatDate(item.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.rating && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{item.rating}</div>
                        <div className="text-xs text-gray-500">/ 5</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">↑ {item.upvotes_count}</div>
                      <div className="text-xs text-gray-500">upvotes</div>
                    </div>
                  </div>
                </div>

                {item.category && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Category: </span>
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                  </div>
                )}

                {item.assigned_to && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Assigned to: </span>
                    <span className="text-sm font-medium text-gray-900">{item.assigned_to}</span>
                  </div>
                )}

                {item.response_text && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-sm font-medium text-green-900 mb-1">Response:</div>
                    <p className="text-sm text-green-800">{item.response_text}</p>
                    {item.responded_at && (
                      <div className="text-xs text-green-600 mt-2">
                        Responded: {formatDate(item.responded_at)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
