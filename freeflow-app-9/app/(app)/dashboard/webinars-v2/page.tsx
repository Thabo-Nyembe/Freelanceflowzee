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
  Calendar, Video, Users, TrendingUp, Plus,
  Upload, Download, RefreshCw, Eye, Play,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'

type WebinarStatus = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'recording'
type WebinarType = 'training' | 'demo' | 'panel' | 'workshop' | 'qa' | 'launch'

interface Webinar {
  id: string
  title: string
  type: WebinarType
  status: WebinarStatus
  host: string
  scheduledDate: string
  duration: number
  registered: number
  attended: number
  capacity: number
  recording: boolean
  views: number
  engagement: number
  questions: number
  polls: number
  tags: string[]
}

const webinars: Webinar[] = [
  {
    id: 'WEB-2847',
    title: 'Product Launch: Next-Gen Analytics Platform',
    type: 'launch',
    status: 'scheduled',
    host: 'Sarah Johnson',
    scheduledDate: '2024-01-15T14:00:00',
    duration: 60,
    registered: 847,
    attended: 0,
    capacity: 1000,
    recording: true,
    views: 0,
    engagement: 0,
    questions: 0,
    polls: 3,
    tags: ['Product', 'Analytics', 'Launch']
  },
  {
    id: 'WEB-2846',
    title: 'Mastering Advanced Data Visualization',
    type: 'training',
    status: 'live',
    host: 'Dr. Michael Chen',
    scheduledDate: '2024-01-12T10:00:00',
    duration: 90,
    registered: 456,
    attended: 389,
    capacity: 500,
    recording: true,
    views: 389,
    engagement: 87,
    questions: 34,
    polls: 2,
    tags: ['Training', 'Data', 'Visualization']
  },
  {
    id: 'WEB-2845',
    title: 'Customer Success Platform Demo',
    type: 'demo',
    status: 'completed',
    host: 'Emily Rodriguez',
    scheduledDate: '2024-01-08T15:00:00',
    duration: 45,
    registered: 312,
    attended: 267,
    capacity: 500,
    recording: true,
    views: 1247,
    engagement: 92,
    questions: 28,
    polls: 1,
    tags: ['Demo', 'Customer Success', 'Platform']
  },
  {
    id: 'WEB-2844',
    title: 'Expert Panel: Future of SaaS Automation',
    type: 'panel',
    status: 'completed',
    host: 'James Wilson',
    scheduledDate: '2024-01-05T16:00:00',
    duration: 75,
    registered: 589,
    attended: 512,
    capacity: 1000,
    recording: true,
    views: 2847,
    engagement: 95,
    questions: 67,
    polls: 4,
    tags: ['Panel', 'SaaS', 'Automation', 'Industry']
  },
  {
    id: 'WEB-2843',
    title: 'Interactive Workshop: API Integration Best Practices',
    type: 'workshop',
    status: 'completed',
    host: 'David Kim',
    scheduledDate: '2024-01-03T11:00:00',
    duration: 120,
    registered: 234,
    attended: 198,
    capacity: 250,
    recording: true,
    views: 847,
    engagement: 88,
    questions: 45,
    polls: 5,
    tags: ['Workshop', 'API', 'Integration', 'Technical']
  },
  {
    id: 'WEB-2842',
    title: 'Monthly Q&A: Product Roadmap Discussion',
    type: 'qa',
    status: 'completed',
    host: 'Lisa Anderson',
    scheduledDate: '2023-12-28T13:00:00',
    duration: 60,
    registered: 178,
    attended: 156,
    capacity: 300,
    recording: true,
    views: 567,
    engagement: 84,
    questions: 52,
    polls: 2,
    tags: ['Q&A', 'Roadmap', 'Product']
  },
  {
    id: 'WEB-2841',
    title: 'Getting Started with Platform Automation',
    type: 'training',
    status: 'completed',
    host: 'Robert Martinez',
    scheduledDate: '2023-12-22T10:00:00',
    duration: 90,
    registered: 412,
    attended: 367,
    capacity: 500,
    recording: true,
    views: 1678,
    engagement: 91,
    questions: 39,
    polls: 3,
    tags: ['Training', 'Automation', 'Beginner']
  },
  {
    id: 'WEB-2840',
    title: 'Live Demo: New Dashboard Features',
    type: 'demo',
    status: 'cancelled',
    host: 'Jennifer Taylor',
    scheduledDate: '2023-12-20T14:00:00',
    duration: 30,
    registered: 289,
    attended: 0,
    capacity: 500,
    recording: false,
    views: 0,
    engagement: 0,
    questions: 0,
    polls: 0,
    tags: ['Demo', 'Dashboard', 'Features']
  }
]

const stats = [
  {
    label: 'Total Webinars',
    value: '847',
    change: 12.5,
    trend: 'up' as const,
    icon: Video
  },
  {
    label: 'Total Attendees',
    value: '12.4K',
    change: 18.3,
    trend: 'up' as const,
    icon: Users
  },
  {
    label: 'Avg Attendance Rate',
    value: '78.5%',
    change: 5.2,
    trend: 'up' as const,
    icon: TrendingUp
  },
  {
    label: 'Recording Views',
    value: '34.2K',
    change: 23.7,
    trend: 'up' as const,
    icon: Play
  }
]

const quickActions = [
  { label: 'Schedule Webinar', icon: Calendar, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Start Live Session', icon: Video, gradient: 'from-red-500 to-pink-600' },
  { label: 'View Recordings', icon: Play, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Upload Recording', icon: Upload, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Export Attendees', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Analytics Report', icon: TrendingUp, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Manage Hosts', icon: Users, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Refresh Data', icon: RefreshCw, gradient: 'from-indigo-500 to-purple-600' }
]

const recentActivity = [
  { action: 'Webinar completed', details: 'Expert Panel: Future of SaaS (512 attendees)', time: '2 hours ago' },
  { action: 'Recording uploaded', details: 'Customer Success Platform Demo', time: '5 hours ago' },
  { action: 'New registration', details: '47 new registrations for Product Launch webinar', time: '1 day ago' },
  { action: 'Webinar scheduled', details: 'Product Launch: Analytics Platform', time: '2 days ago' },
  { action: 'Host assigned', details: 'Sarah Johnson assigned to WEB-2847', time: '2 days ago' }
]

const topWebinars = [
  { name: 'Expert Panel: Future of SaaS', metric: '2,847 views' },
  { name: 'Getting Started with Automation', metric: '1,678 views' },
  { name: 'Customer Success Demo', metric: '1,247 views' },
  { name: 'API Integration Workshop', metric: '847 views' },
  { name: 'Monthly Q&A: Roadmap', metric: '567 views' }
]

export default function WebinarsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all')

  const filteredWebinars = webinars.filter(webinar => {
    if (viewMode === 'all') return true
    if (viewMode === 'upcoming') return webinar.status === 'scheduled'
    if (viewMode === 'live') return webinar.status === 'live'
    if (viewMode === 'completed') return webinar.status === 'completed'
    return true
  })

  const getStatusColor = (status: WebinarStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'live': return 'bg-red-100 text-red-700 border-red-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'recording': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: WebinarStatus) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'live': return <Video className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      case 'recording': return <Play className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: WebinarType) => {
    switch (type) {
      case 'training': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'demo': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'panel': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'workshop': return 'bg-green-50 text-green-600 border-green-100'
      case 'qa': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'launch': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: WebinarType) => {
    switch (type) {
      case 'training': return 'from-blue-500 to-cyan-600'
      case 'demo': return 'from-purple-500 to-pink-600'
      case 'panel': return 'from-indigo-500 to-purple-600'
      case 'workshop': return 'from-green-500 to-emerald-600'
      case 'qa': return 'from-orange-500 to-red-600'
      case 'launch': return 'from-red-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const calculateAttendanceRate = (attended: number, registered: number) => {
    if (registered === 0) return 0
    return Math.round((attended / registered) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Webinars
            </h1>
            <p className="text-gray-600 mt-2">Manage virtual events and online sessions</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Schedule Webinar
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
            label="All Webinars"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Upcoming"
            isActive={viewMode === 'upcoming'}
            onClick={() => setViewMode('upcoming')}
          />
          <PillButton
            label="Live Now"
            isActive={viewMode === 'live'}
            onClick={() => setViewMode('live')}
          />
          <PillButton
            label="Completed"
            isActive={viewMode === 'completed'}
            onClick={() => setViewMode('completed')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Webinars List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Webinars'}
              {viewMode === 'upcoming' && 'Upcoming Webinars'}
              {viewMode === 'live' && 'Live Webinars'}
              {viewMode === 'completed' && 'Completed Webinars'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredWebinars.length} total)
              </span>
            </h2>

            {filteredWebinars.map((webinar) => (
              <div
                key={webinar.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(webinar.status)} flex items-center gap-1`}>
                        {getStatusIcon(webinar.status)}
                        {webinar.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(webinar.type)}`}>
                        {webinar.type}
                      </span>
                      {webinar.recording && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-600 border-purple-100 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Recording
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {webinar.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {webinar.id} • Host: {webinar.host}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(webinar.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(webinar.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{webinar.duration} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Registered</p>
                    <p className="text-sm font-semibold text-gray-900">{webinar.registered.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Attended</p>
                    <p className="text-sm font-semibold text-gray-900">{webinar.attended.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Capacity</span>
                      <span>{webinar.registered} / {webinar.capacity} ({Math.round((webinar.registered / webinar.capacity) * 100)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(webinar.type)} rounded-full transition-all`}
                        style={{ width: `${Math.min((webinar.registered / webinar.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {webinar.status === 'completed' && (
                    <>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Attendance Rate</span>
                          <span>{calculateAttendanceRate(webinar.attended, webinar.registered)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                            style={{ width: `${calculateAttendanceRate(webinar.attended, webinar.registered)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Engagement Score</span>
                          <span>{webinar.engagement}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all"
                            style={{ width: `${webinar.engagement}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  {webinar.status === 'completed' && (
                    <>
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4 text-purple-600" />
                        <span>{webinar.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <span>{webinar.questions} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{webinar.polls} polls</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {webinar.tags.map((tag, index) => (
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

            {/* Webinar Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Webinar Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'training', count: 247, percentage: 29 },
                  { type: 'demo', count: 189, percentage: 22 },
                  { type: 'panel', count: 156, percentage: 18 },
                  { type: 'workshop', count: 134, percentage: 16 },
                  { type: 'qa', count: 89, percentage: 11 },
                  { type: 'launch', count: 32, percentage: 4 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as WebinarType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Webinars */}
            <RankingList
              title="Top Webinars"
              items={topWebinars}
              gradient="from-blue-500 to-purple-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Engagement"
              value="89.2%"
              change={6.8}
              trend="up"
            />

            <ProgressCard
              title="Monthly Target"
              current={24}
              target={30}
              label="webinars"
              gradient="from-blue-500 to-purple-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
