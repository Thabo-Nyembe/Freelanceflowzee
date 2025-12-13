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
  BarChart2, Users, TrendingUp, CheckSquare, Plus,
  Send, Eye, Download, RefreshCw, Settings,
  Clock, CheckCircle, XCircle, Share2
} from 'lucide-react'

type PollStatus = 'draft' | 'active' | 'scheduled' | 'closed' | 'archived'
type PollType = 'single-choice' | 'multiple-choice' | 'rating' | 'yes-no' | 'ranking'

interface PollOption {
  label: string
  votes: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  description: string
  type: PollType
  status: PollStatus
  createdBy: string
  createdDate: string
  publishedDate?: string
  closedDate?: string
  options: PollOption[]
  totalVotes: number
  uniqueVoters: number
  allowMultipleVotes: boolean
  isAnonymous: boolean
  showResults: 'always' | 'after-vote' | 'after-close'
  targetAudience: string
  tags: string[]
}

const polls: Poll[] = [
  {
    id: 'POL-2847',
    question: 'Which new feature should we prioritize next?',
    description: 'Help us decide what to build next by voting for your preferred feature',
    type: 'single-choice',
    status: 'active',
    createdBy: 'Product Team',
    createdDate: '2024-01-10T09:00:00',
    publishedDate: '2024-01-11T10:00:00',
    options: [
      { label: 'Dark Mode', votes: 1847, percentage: 42 },
      { label: 'Mobile App', votes: 1289, percentage: 29 },
      { label: 'API Integration', votes: 847, percentage: 19 },
      { label: 'Advanced Analytics', votes: 434, percentage: 10 }
    ],
    totalVotes: 4417,
    uniqueVoters: 4289,
    allowMultipleVotes: false,
    isAnonymous: false,
    showResults: 'always',
    targetAudience: 'All Users',
    tags: ['Product', 'Features', 'Roadmap', 'Priority']
  },
  {
    id: 'POL-2846',
    question: 'How would you rate our customer support?',
    description: 'We value your feedback on our support team performance',
    type: 'rating',
    status: 'active',
    createdBy: 'Support Team',
    createdDate: '2024-01-08T14:00:00',
    publishedDate: '2024-01-09T09:00:00',
    options: [
      { label: '5 Stars - Excellent', votes: 2134, percentage: 45 },
      { label: '4 Stars - Good', votes: 1678, percentage: 35 },
      { label: '3 Stars - Average', votes: 689, percentage: 14 },
      { label: '2 Stars - Poor', votes: 189, percentage: 4 },
      { label: '1 Star - Very Poor', votes: 89, percentage: 2 }
    ],
    totalVotes: 4779,
    uniqueVoters: 4779,
    allowMultipleVotes: false,
    isAnonymous: true,
    showResults: 'after-close',
    targetAudience: 'Customers',
    tags: ['Support', 'Rating', 'Customer Service', 'Feedback']
  },
  {
    id: 'POL-2845',
    question: 'Should we implement two-factor authentication?',
    description: 'Vote on whether we should add 2FA as a security feature',
    type: 'yes-no',
    status: 'closed',
    createdBy: 'Security Team',
    createdDate: '2024-01-05T10:00:00',
    publishedDate: '2024-01-06T09:00:00',
    closedDate: '2024-01-10T23:59:59',
    options: [
      { label: 'Yes, definitely', votes: 3847, percentage: 87 },
      { label: 'No, not needed', votes: 567, percentage: 13 }
    ],
    totalVotes: 4414,
    uniqueVoters: 4414,
    allowMultipleVotes: false,
    isAnonymous: false,
    showResults: 'always',
    targetAudience: 'All Users',
    tags: ['Security', '2FA', 'Feature Request', 'Yes/No']
  },
  {
    id: 'POL-2844',
    question: 'Which collaboration features do you use most?',
    description: 'Select all the collaboration features you regularly use',
    type: 'multiple-choice',
    status: 'active',
    createdBy: 'Product Team',
    createdDate: '2024-01-07T11:00:00',
    publishedDate: '2024-01-08T10:00:00',
    options: [
      { label: 'Comments & Mentions', votes: 2847, percentage: 65 },
      { label: 'Real-time Editing', votes: 2456, percentage: 56 },
      { label: 'File Sharing', votes: 2134, percentage: 49 },
      { label: 'Video Calls', votes: 1678, percentage: 38 },
      { label: 'Screen Sharing', votes: 1234, percentage: 28 }
    ],
    totalVotes: 10349,
    uniqueVoters: 4389,
    allowMultipleVotes: true,
    isAnonymous: false,
    showResults: 'after-vote',
    targetAudience: 'Active Users',
    tags: ['Collaboration', 'Features', 'Usage', 'Multiple Choice']
  },
  {
    id: 'POL-2843',
    question: 'Rank these pricing plans by value',
    description: 'Help us understand which pricing plans offer the best value',
    type: 'ranking',
    status: 'active',
    createdBy: 'Pricing Team',
    createdDate: '2024-01-03T13:00:00',
    publishedDate: '2024-01-05T09:00:00',
    options: [
      { label: 'Enterprise Plan', votes: 1247, percentage: 38 },
      { label: 'Professional Plan', votes: 1089, percentage: 33 },
      { label: 'Team Plan', votes: 689, percentage: 21 },
      { label: 'Starter Plan', votes: 267, percentage: 8 }
    ],
    totalVotes: 3292,
    uniqueVoters: 3292,
    allowMultipleVotes: false,
    isAnonymous: true,
    showResults: 'after-close',
    targetAudience: 'Premium Users',
    tags: ['Pricing', 'Value', 'Ranking', 'Plans']
  },
  {
    id: 'POL-2842',
    question: 'Would you recommend our platform to a colleague?',
    description: 'Quick NPS-style poll to measure customer loyalty',
    type: 'yes-no',
    status: 'closed',
    createdBy: 'Customer Success',
    createdDate: '2024-01-01T10:00:00',
    publishedDate: '2024-01-02T09:00:00',
    closedDate: '2024-01-08T23:59:59',
    options: [
      { label: 'Yes, I would recommend', votes: 8934, percentage: 89 },
      { label: 'No, I would not', votes: 1123, percentage: 11 }
    ],
    totalVotes: 10057,
    uniqueVoters: 10057,
    allowMultipleVotes: false,
    isAnonymous: true,
    showResults: 'after-close',
    targetAudience: 'All Customers',
    tags: ['NPS', 'Loyalty', 'Recommendation', 'Customer']
  },
  {
    id: 'POL-2841',
    question: 'Best time for weekly team meeting?',
    description: 'Vote on the best time slot for our weekly all-hands meeting',
    type: 'single-choice',
    status: 'closed',
    createdBy: 'HR Department',
    createdDate: '2023-12-28T14:00:00',
    publishedDate: '2024-01-02T09:00:00',
    closedDate: '2024-01-05T17:00:00',
    options: [
      { label: 'Monday 10:00 AM', votes: 247, percentage: 28 },
      { label: 'Wednesday 2:00 PM', votes: 389, percentage: 44 },
      { label: 'Friday 11:00 AM', votes: 156, percentage: 18 },
      { label: 'Thursday 3:00 PM', votes: 89, percentage: 10 }
    ],
    totalVotes: 881,
    uniqueVoters: 881,
    allowMultipleVotes: false,
    isAnonymous: false,
    showResults: 'always',
    targetAudience: 'Employees',
    tags: ['Meeting', 'Schedule', 'Team', 'Internal']
  },
  {
    id: 'POL-2840',
    question: 'Which integration should we build first?',
    description: 'Help prioritize our integration roadmap',
    type: 'single-choice',
    status: 'scheduled',
    createdBy: 'Integration Team',
    createdDate: '2024-01-11T15:00:00',
    publishedDate: '2024-01-15T09:00:00',
    options: [
      { label: 'Salesforce', votes: 0, percentage: 0 },
      { label: 'HubSpot', votes: 0, percentage: 0 },
      { label: 'Jira', votes: 0, percentage: 0 },
      { label: 'Zendesk', votes: 0, percentage: 0 }
    ],
    totalVotes: 0,
    uniqueVoters: 0,
    allowMultipleVotes: false,
    isAnonymous: false,
    showResults: 'after-vote',
    targetAudience: 'Enterprise Users',
    tags: ['Integration', 'Roadmap', 'Priority', 'Scheduled']
  }
]

const stats = [
  {
    label: 'Total Polls',
    value: '247',
    change: 15.3,
    trend: 'up' as const,
    icon: BarChart2
  },
  {
    label: 'Total Votes',
    value: '124.5K',
    change: 32.7,
    trend: 'up' as const,
    icon: CheckSquare
  },
  {
    label: 'Avg Participation',
    value: '67.3%',
    change: 8.4,
    trend: 'up' as const,
    icon: Users
  },
  {
    label: 'Active Polls',
    value: '42',
    change: 12.5,
    trend: 'up' as const,
    icon: TrendingUp
  }
]

const quickActions = [
  { label: 'Create Poll', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Publish Poll', icon: Send, gradient: 'from-green-500 to-emerald-600' },
  { label: 'View Results', icon: Eye, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Share Poll', icon: Share2, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Manage Settings', icon: Settings, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Schedule Poll', icon: Clock, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'High participation', details: 'Feature priority poll reached 4K votes', time: '2 hours ago' },
  { action: 'Poll closed', details: '2FA implementation poll ended with 87% yes', time: '2 days ago' },
  { action: 'Poll published', details: 'Support rating poll activated', time: '3 days ago' },
  { action: 'Poll scheduled', details: 'Integration priority poll scheduled for Jan 15', time: '1 day ago' },
  { action: 'Consensus reached', details: 'NPS poll showed 89% would recommend', time: '4 days ago' }
]

const topPolls = [
  { name: 'Would you recommend our platform?', metric: '10,057 votes' },
  { name: 'Which collaboration features?', metric: '10,349 votes' },
  { name: 'Rate our customer support', metric: '4,779 votes' },
  { name: 'Which feature to prioritize?', metric: '4,417 votes' },
  { name: 'Implement two-factor auth?', metric: '4,414 votes' }
]

export default function PollsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'closed' | 'scheduled'>('all')

  const filteredPolls = polls.filter(poll => {
    if (viewMode === 'all') return true
    if (viewMode === 'active') return poll.status === 'active'
    if (viewMode === 'closed') return poll.status === 'closed'
    if (viewMode === 'scheduled') return poll.status === 'scheduled'
    return true
  })

  const getStatusColor = (status: PollStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'closed': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'archived': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: PollStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'closed': return <XCircle className="w-3 h-3" />
      case 'archived': return <XCircle className="w-3 h-3" />
      default: return <BarChart2 className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: PollType) => {
    switch (type) {
      case 'single-choice': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'multiple-choice': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'rating': return 'bg-green-50 text-green-600 border-green-100'
      case 'yes-no': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'ranking': return 'bg-pink-50 text-pink-600 border-pink-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: PollType) => {
    switch (type) {
      case 'single-choice': return 'from-blue-500 to-cyan-600'
      case 'multiple-choice': return 'from-purple-500 to-pink-600'
      case 'rating': return 'from-green-500 to-emerald-600'
      case 'yes-no': return 'from-orange-500 to-red-600'
      case 'ranking': return 'from-pink-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateParticipationRate = (uniqueVoters: number, totalVotes: number) => {
    if (totalVotes === 0) return 100
    return Math.round((uniqueVoters / totalVotes) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Polls
            </h1>
            <p className="text-gray-600 mt-2">Quick feedback and decision-making polls</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Poll
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
            label="All Polls"
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
            label="Scheduled"
            isActive={viewMode === 'scheduled'}
            onClick={() => setViewMode('scheduled')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Polls List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Polls'}
              {viewMode === 'active' && 'Active Polls'}
              {viewMode === 'closed' && 'Closed Polls'}
              {viewMode === 'scheduled' && 'Scheduled Polls'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredPolls.length} total)
              </span>
            </h2>

            {filteredPolls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(poll.status)} flex items-center gap-1`}>
                        {getStatusIcon(poll.status)}
                        {poll.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(poll.type)}`}>
                        {poll.type}
                      </span>
                      {poll.isAnonymous && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {poll.question}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {poll.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {poll.id} • Created by {poll.createdBy} • Target: {poll.targetAudience}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(poll.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Votes</p>
                    <p className="text-sm font-semibold text-gray-900">{poll.totalVotes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Unique Voters</p>
                    <p className="text-sm font-semibold text-gray-900">{poll.uniqueVoters.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Options</p>
                    <p className="text-sm font-semibold text-gray-900">{poll.options.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Published</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {poll.publishedDate ? formatDate(poll.publishedDate) : 'Not yet'}
                    </p>
                  </div>
                </div>

                {/* Poll Options with Results */}
                {poll.status !== 'draft' && poll.totalVotes > 0 && (
                  <div className="space-y-3 mb-4">
                    {poll.options.map((option, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{option.label}</span>
                          <span className="text-gray-900 font-semibold">
                            {option.votes.toLocaleString()} ({option.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getTypeGradient(poll.type)} rounded-full transition-all`}
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Poll Stats */}
                {poll.status !== 'draft' && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{calculateParticipationRate(poll.uniqueVoters, poll.totalVotes)}% participation</span>
                    </div>
                    {poll.closedDate && (
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Closed {formatDate(poll.closedDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span>Results: {poll.showResults}</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {poll.tags.map((tag, index) => (
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

            {/* Poll Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Poll Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'single-choice', count: 98, percentage: 40 },
                  { type: 'multiple-choice', count: 67, percentage: 27 },
                  { type: 'rating', count: 42, percentage: 17 },
                  { type: 'yes-no', count: 28, percentage: 11 },
                  { type: 'ranking', count: 12, percentage: 5 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 text-xs">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as PollType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Polls */}
            <RankingList
              title="Most Popular"
              items={topPolls}
              gradient="from-teal-500 to-cyan-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Vote Time"
              value="1.8 min"
              change={-18.4}
              trend="down"
            />

            <ProgressCard
              title="Monthly Target"
              current={42}
              target={50}
              label="active polls"
              gradient="from-teal-500 to-cyan-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
