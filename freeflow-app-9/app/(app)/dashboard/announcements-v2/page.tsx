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
  Megaphone, Users, Eye, TrendingUp, Plus,
  Send, Calendar, CheckCircle, XCircle, Clock,
  AlertCircle, Download, RefreshCw, Settings
} from 'lucide-react'

type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived'
type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
type AnnouncementCategory = 'company' | 'product' | 'event' | 'policy' | 'maintenance' | 'emergency'
type TargetAudience = 'all' | 'employees' | 'customers' | 'partners' | 'investors'

interface Announcement {
  id: string
  title: string
  content: string
  status: AnnouncementStatus
  priority: AnnouncementPriority
  category: AnnouncementCategory
  author: string
  targetAudience: TargetAudience[]
  publishDate: string
  expiryDate?: string
  views: number
  clicks: number
  engagement: number
  isPinned: boolean
  allowComments: boolean
  comments: number
  tags: string[]
}

const announcements: Announcement[] = [
  {
    id: 'ANN-2847',
    title: 'Q1 2024 Product Launch: Next-Generation Analytics Platform',
    content: 'We are excited to announce the launch of our revolutionary analytics platform featuring real-time insights, AI-powered predictions, and seamless integrations with all major data sources.',
    status: 'published',
    priority: 'high',
    category: 'product',
    author: 'Sarah Johnson',
    targetAudience: ['all', 'customers'],
    publishDate: '2024-01-12T09:00:00',
    expiryDate: '2024-03-31T23:59:59',
    views: 12847,
    clicks: 3456,
    engagement: 92,
    isPinned: true,
    allowComments: true,
    comments: 247,
    tags: ['Product Launch', 'Analytics', 'Q1 2024']
  },
  {
    id: 'ANN-2846',
    title: 'Scheduled System Maintenance - January 15th',
    content: 'Our platform will undergo scheduled maintenance on January 15th from 2:00 AM to 4:00 AM UTC. During this time, services may experience brief interruptions.',
    status: 'published',
    priority: 'urgent',
    category: 'maintenance',
    author: 'IT Operations Team',
    targetAudience: ['all'],
    publishDate: '2024-01-10T14:00:00',
    expiryDate: '2024-01-16T00:00:00',
    views: 8934,
    clicks: 1247,
    engagement: 78,
    isPinned: true,
    allowComments: false,
    comments: 0,
    tags: ['Maintenance', 'System', 'Downtime']
  },
  {
    id: 'ANN-2845',
    title: 'Updated Data Privacy Policy - Effective February 1st',
    content: 'We have updated our data privacy policy to provide enhanced transparency and control over your data. Please review the changes before February 1st, 2024.',
    status: 'published',
    priority: 'high',
    category: 'policy',
    author: 'Legal Department',
    targetAudience: ['all', 'customers', 'employees'],
    publishDate: '2024-01-08T10:00:00',
    expiryDate: '2024-02-01T23:59:59',
    views: 15678,
    clicks: 4289,
    engagement: 84,
    isPinned: false,
    allowComments: true,
    comments: 156,
    tags: ['Policy', 'Privacy', 'Legal', 'Compliance']
  },
  {
    id: 'ANN-2844',
    title: 'Annual Company Summit 2024 - Save the Date',
    content: 'Join us for our Annual Company Summit on March 15-17, 2024 in San Francisco. Registration opens next week!',
    status: 'scheduled',
    priority: 'normal',
    category: 'event',
    author: 'Events Team',
    targetAudience: ['employees', 'partners'],
    publishDate: '2024-01-15T08:00:00',
    views: 0,
    clicks: 0,
    engagement: 0,
    isPinned: false,
    allowComments: true,
    comments: 0,
    tags: ['Event', 'Summit', 'Company']
  },
  {
    id: 'ANN-2843',
    title: 'New Employee Benefits Program Launched',
    content: 'We are pleased to introduce an enhanced benefits package including expanded health coverage, wellness programs, and professional development stipends.',
    status: 'published',
    priority: 'normal',
    category: 'company',
    author: 'HR Department',
    targetAudience: ['employees'],
    publishDate: '2024-01-05T09:00:00',
    views: 5647,
    clicks: 2134,
    engagement: 88,
    isPinned: false,
    allowComments: true,
    comments: 89,
    tags: ['Benefits', 'HR', 'Employees']
  },
  {
    id: 'ANN-2842',
    title: 'Q4 2023 Investor Update',
    content: 'Review our Q4 2023 performance highlights, including 45% revenue growth, 12 new enterprise customers, and successful Series C funding round.',
    status: 'published',
    priority: 'high',
    category: 'company',
    author: 'Executive Team',
    targetAudience: ['investors', 'partners'],
    publishDate: '2024-01-03T15:00:00',
    views: 3847,
    clicks: 1289,
    engagement: 95,
    isPinned: false,
    allowComments: false,
    comments: 0,
    tags: ['Investors', 'Q4', 'Performance', 'Financial']
  },
  {
    id: 'ANN-2841',
    title: 'Emergency Security Update Required',
    content: 'URGENT: All users must update their passwords due to a detected security vulnerability. Please update your password immediately.',
    status: 'archived',
    priority: 'urgent',
    category: 'emergency',
    author: 'Security Team',
    targetAudience: ['all'],
    publishDate: '2023-12-28T10:00:00',
    expiryDate: '2024-01-05T23:59:59',
    views: 24567,
    clicks: 18942,
    engagement: 97,
    isPinned: false,
    allowComments: false,
    comments: 0,
    tags: ['Security', 'Emergency', 'Password']
  },
  {
    id: 'ANN-2840',
    title: 'Holiday Office Closure Notice',
    content: 'Our offices will be closed from December 24th through January 1st. We will resume normal operations on January 2nd, 2024.',
    status: 'archived',
    priority: 'normal',
    category: 'company',
    author: 'Operations',
    targetAudience: ['all'],
    publishDate: '2023-12-15T09:00:00',
    expiryDate: '2024-01-02T00:00:00',
    views: 7234,
    clicks: 456,
    engagement: 65,
    isPinned: false,
    allowComments: false,
    comments: 0,
    tags: ['Holiday', 'Closure', 'Office']
  }
]

const stats = [
  {
    label: 'Total Announcements',
    value: '847',
    change: 12.5,
    trend: 'up' as const,
    icon: Megaphone
  },
  {
    label: 'Total Views',
    value: '124.5K',
    change: 28.7,
    trend: 'up' as const,
    icon: Eye
  },
  {
    label: 'Avg Engagement',
    value: '85.3%',
    change: 6.2,
    trend: 'up' as const,
    icon: TrendingUp
  },
  {
    label: 'Active Readers',
    value: '12.4K',
    change: 15.4,
    trend: 'up' as const,
    icon: Users
  }
]

const quickActions = [
  { label: 'Create Announcement', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Publish Scheduled', icon: Send, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Schedule New', icon: Calendar, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'View Analytics', icon: TrendingUp, gradient: 'from-orange-500 to-red-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Manage Audience', icon: Users, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Settings', icon: Settings, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Announcement published', details: 'Product Launch announcement went live', time: '2 hours ago' },
  { action: 'High engagement', details: 'Policy update reached 15K views', time: '5 hours ago' },
  { action: 'Comment added', details: '47 new comments on Benefits Program', time: '1 day ago' },
  { action: 'Announcement scheduled', details: 'Company Summit scheduled for Jan 15', time: '1 day ago' },
  { action: 'Expired', details: 'Holiday closure notice auto-archived', time: '2 days ago' }
]

const topAnnouncements = [
  { name: 'Emergency Security Update', metric: '24,567 views' },
  { name: 'Data Privacy Policy Update', metric: '15,678 views' },
  { name: 'Product Launch Q1 2024', metric: '12,847 views' },
  { name: 'System Maintenance Notice', metric: '8,934 views' },
  { name: 'Holiday Office Closure', metric: '7,234 views' }
]

export default function AnnouncementsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'scheduled' | 'pinned'>('all')

  const filteredAnnouncements = announcements.filter(announcement => {
    if (viewMode === 'all') return true
    if (viewMode === 'published') return announcement.status === 'published'
    if (viewMode === 'scheduled') return announcement.status === 'scheduled'
    if (viewMode === 'pinned') return announcement.isPinned
    return true
  })

  const getStatusColor = (status: AnnouncementStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'archived': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: AnnouncementStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'scheduled': return <Calendar className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'archived': return <XCircle className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-50 text-gray-600 border-gray-100'
      case 'normal': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'urgent': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getCategoryColor = (category: AnnouncementCategory) => {
    switch (category) {
      case 'company': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'product': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'event': return 'bg-green-50 text-green-600 border-green-100'
      case 'policy': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'maintenance': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'emergency': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getCategoryGradient = (category: AnnouncementCategory) => {
    switch (category) {
      case 'company': return 'from-blue-500 to-cyan-600'
      case 'product': return 'from-purple-500 to-pink-600'
      case 'event': return 'from-green-500 to-emerald-600'
      case 'policy': return 'from-indigo-500 to-purple-600'
      case 'maintenance': return 'from-orange-500 to-red-600'
      case 'emergency': return 'from-red-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const calculateClickRate = (clicks: number, views: number) => {
    if (views === 0) return 0
    return Math.round((clicks / views) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Announcements
            </h1>
            <p className="text-gray-600 mt-2">Communicate important updates to your audience</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Announcement
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
            label="All Announcements"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Published"
            isActive={viewMode === 'published'}
            onClick={() => setViewMode('published')}
          />
          <PillButton
            label="Scheduled"
            isActive={viewMode === 'scheduled'}
            onClick={() => setViewMode('scheduled')}
          />
          <PillButton
            label="Pinned"
            isActive={viewMode === 'pinned'}
            onClick={() => setViewMode('pinned')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Announcements List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Announcements'}
              {viewMode === 'published' && 'Published Announcements'}
              {viewMode === 'scheduled' && 'Scheduled Announcements'}
              {viewMode === 'pinned' && 'Pinned Announcements'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredAnnouncements.length} total)
              </span>
            </h2>

            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(announcement.status)} flex items-center gap-1`}>
                        {getStatusIcon(announcement.status)}
                        {announcement.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      {announcement.isPinned && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-600 border-yellow-100">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {announcement.id} • By {announcement.author}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getCategoryGradient(announcement.category)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Published</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(announcement.publishDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Views</p>
                    <p className="text-sm font-semibold text-gray-900">{announcement.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Clicks</p>
                    <p className="text-sm font-semibold text-gray-900">{announcement.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Comments</p>
                    <p className="text-sm font-semibold text-gray-900">{announcement.comments}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Engagement Score</span>
                      <span>{announcement.engagement}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getCategoryGradient(announcement.category)} rounded-full transition-all`}
                        style={{ width: `${announcement.engagement}%` }}
                      />
                    </div>
                  </div>

                  {announcement.status === 'published' && announcement.views > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Click-Through Rate</span>
                        <span>{calculateClickRate(announcement.clicks, announcement.views)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${calculateClickRate(announcement.clicks, announcement.views)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Audience */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Target Audience</p>
                  <div className="flex flex-wrap gap-2">
                    {announcement.targetAudience.map((audience, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {announcement.tags.map((tag, index) => (
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

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Categories</h3>
              <div className="space-y-3">
                {[
                  { category: 'company', count: 247, percentage: 29 },
                  { category: 'product', count: 189, percentage: 22 },
                  { category: 'event', count: 156, percentage: 18 },
                  { category: 'policy', count: 134, percentage: 16 },
                  { category: 'maintenance', count: 89, percentage: 11 },
                  { category: 'emergency', count: 32, percentage: 4 }
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.category}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getCategoryGradient(item.category as AnnouncementCategory)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Announcements */}
            <RankingList
              title="Most Viewed"
              items={topAnnouncements}
              gradient="from-blue-500 to-indigo-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Click Rate"
              value="26.9%"
              change={8.4}
              trend="up"
            />

            <ProgressCard
              title="Monthly Target"
              current={42}
              target={50}
              label="announcements"
              gradient="from-blue-500 to-indigo-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
