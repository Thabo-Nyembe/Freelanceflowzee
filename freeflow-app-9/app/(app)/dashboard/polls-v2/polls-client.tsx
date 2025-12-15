// Polls V2 - Client Component with Real-time Data
// Created: December 14, 2024

'use client'

import { useState } from 'react'
import { usePolls, type Poll, type PollStatus, type PollType } from '@/lib/hooks/use-polls'

interface PollsClientProps {
  initialPolls: Poll[]
}

export default function PollsClient({ initialPolls }: PollsClientProps) {
  const [statusFilter, setStatusFilter] = useState<PollStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PollType | 'all'>('all')

  const { polls, loading, error } = usePolls({
    status: statusFilter,
    pollType: typeFilter,
    limit: 50
  })

  const displayPolls = polls.length > 0 ? polls : initialPolls

  // Filter client-side for better UX
  const filteredPolls = displayPolls.filter(poll => {
    if (statusFilter !== 'all' && poll.status !== statusFilter) return false
    if (typeFilter !== 'all' && poll.poll_type !== typeFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayPolls.length,
    byStatus: displayPolls.reduce((acc, poll) => {
      acc[poll.status] = (acc[poll.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: displayPolls.reduce((acc, poll) => {
      acc[poll.poll_type] = (acc[poll.poll_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    totalVotes: displayPolls.reduce((acc, poll) => acc + (poll.total_votes || 0), 0),
    totalVoters: displayPolls.reduce((acc, poll) => acc + (poll.total_voters || 0), 0)
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

  const getStatusColor = (status: PollStatus) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-700',
      'active': 'bg-green-100 text-green-700',
      'paused': 'bg-yellow-100 text-yellow-700',
      'closed': 'bg-red-100 text-red-700',
      'archived': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: PollType) => {
    const colors = {
      'single-choice': 'bg-blue-50 text-blue-600',
      'multiple-choice': 'bg-purple-50 text-purple-600',
      'rating': 'bg-yellow-50 text-yellow-600',
      'ranking': 'bg-indigo-50 text-indigo-600',
      'open-ended': 'bg-green-50 text-green-600'
    }
    return colors[type] || 'bg-gray-50 text-gray-600'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading polls: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Polls
            </h1>
            <p className="text-gray-600 mt-2">Create and manage polls for quick feedback</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all">
            + Create Poll
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Polls</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-green-600 mt-1">↑ Real-time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{stats.byStatus.active || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Currently open</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Votes</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalVotes}</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Unique Voters</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalVoters}</div>
            <div className="text-xs text-gray-500 mt-1">Participants</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PollStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PollType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Types</option>
                <option value="single-choice">Single Choice</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="rating">Rating</option>
                <option value="ranking">Ranking</option>
                <option value="open-ended">Open Ended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading polls...</p>
          </div>
        )}

        {/* Polls List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Polls ({filteredPolls.length})
            </h2>
          </div>

          {filteredPolls.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No polls found</h3>
              <p className="text-gray-600">Create your first poll to get started!</p>
            </div>
          ) : (
            filteredPolls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(poll.status)}`}>
                        {poll.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(poll.poll_type)}`}>
                        {poll.poll_type}
                      </span>
                      {poll.is_public && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          Public
                        </span>
                      )}
                      {poll.allow_anonymous && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                          Anonymous
                        </span>
                      )}
                      {poll.allow_multiple_votes && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          Multiple Votes
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.question}</h3>
                    {poll.description && (
                      <p className="text-gray-700 mb-3">{poll.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Options: {poll.option_count}</span>
                      <span>Created: {formatDate(poll.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{poll.total_votes}</div>
                      <div className="text-xs text-gray-500">votes</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">{poll.total_voters}</div>
                      <div className="text-xs text-gray-500">voters</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Views</div>
                    <div className="text-sm font-semibold text-gray-900">{poll.views_count}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Shares</div>
                    <div className="text-sm font-semibold text-gray-900">{poll.shares_count}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Comments</div>
                    <div className="text-sm font-semibold text-gray-900">{poll.comments_count}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Display Mode</div>
                    <div className="text-sm font-semibold text-gray-900">{poll.display_mode}</div>
                  </div>
                </div>

                {poll.starts_at && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">Opens:</span> {formatDate(poll.starts_at)}
                  </div>
                )}

                {poll.ends_at && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Closes:</span> {formatDate(poll.ends_at)}
                  </div>
                )}

                {poll.duration_hours && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Duration:</span> {poll.duration_hours} hours
                  </div>
                )}

                {poll.target_audience && poll.target_audience !== 'all' && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Audience:</span> {poll.target_audience}
                  </div>
                )}

                {poll.winner_option_id && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-sm font-medium text-green-900">
                      Winner: Option {poll.winner_option_id}
                    </div>
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
