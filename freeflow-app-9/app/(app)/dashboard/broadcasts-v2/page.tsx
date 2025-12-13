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
  Radio, Send, Users, TrendingUp, Plus,
  Mail, MessageSquare, CheckCircle, XCircle, Clock,
  Eye, Download, Upload, RefreshCw, Settings
} from 'lucide-react'

type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
type BroadcastChannel = 'email' | 'sms' | 'push' | 'in-app' | 'slack' | 'teams'
type BroadcastType = 'marketing' | 'transactional' | 'announcement' | 'alert' | 'newsletter'

interface Broadcast {
  id: string
  title: string
  subject: string
  message: string
  type: BroadcastType
  status: BroadcastStatus
  channels: BroadcastChannel[]
  targetSegment: string
  scheduledDate?: string
  sentDate?: string
  recipientsTotal: number
  recipientsDelivered: number
  recipientsFailed: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  author: string
  tags: string[]
}

const broadcasts: Broadcast[] = [
  {
    id: 'BRD-2847',
    title: 'Q1 Product Launch Campaign',
    subject: 'Introducing Our Next-Generation Analytics Platform',
    message: 'We are thrilled to announce the launch of our revolutionary analytics platform...',
    type: 'marketing',
    status: 'sent',
    channels: ['email', 'push', 'in-app'],
    targetSegment: 'All Active Customers',
    sentDate: '2024-01-12T09:00:00',
    recipientsTotal: 24567,
    recipientsDelivered: 24123,
    recipientsFailed: 444,
    openRate: 42.5,
    clickRate: 8.7,
    bounceRate: 1.8,
    unsubscribeRate: 0.3,
    author: 'Sarah Johnson',
    tags: ['Product Launch', 'Q1', 'Marketing']
  },
  {
    id: 'BRD-2846',
    title: 'Critical Security Alert',
    subject: 'Immediate Action Required: Security Update',
    message: 'We have detected a security vulnerability that requires immediate attention...',
    type: 'alert',
    status: 'sent',
    channels: ['email', 'sms', 'push', 'in-app'],
    targetSegment: 'All Users',
    sentDate: '2024-01-11T14:30:00',
    recipientsTotal: 45892,
    recipientsDelivered: 45678,
    recipientsFailed: 214,
    openRate: 87.3,
    clickRate: 74.2,
    bounceRate: 0.5,
    unsubscribeRate: 0.1,
    author: 'Security Team',
    tags: ['Security', 'Alert', 'Urgent']
  },
  {
    id: 'BRD-2845',
    title: 'Monthly Newsletter - January 2024',
    subject: 'Your Monthly Digest: Product Updates & Tips',
    message: 'Catch up on the latest product updates, customer success stories, and expert tips...',
    type: 'newsletter',
    status: 'sent',
    channels: ['email'],
    targetSegment: 'Newsletter Subscribers',
    sentDate: '2024-01-08T10:00:00',
    recipientsTotal: 18934,
    recipientsDelivered: 18456,
    recipientsFailed: 478,
    openRate: 38.9,
    clickRate: 6.4,
    bounceRate: 2.5,
    unsubscribeRate: 0.8,
    author: 'Marketing Team',
    tags: ['Newsletter', 'Monthly', 'Updates']
  },
  {
    id: 'BRD-2844',
    title: 'Webinar Invitation: Analytics Best Practices',
    subject: 'Join Our Expert Webinar - January 18th',
    message: 'Reserve your spot for our upcoming webinar on analytics best practices...',
    type: 'marketing',
    status: 'scheduled',
    channels: ['email', 'push'],
    targetSegment: 'Enterprise Customers',
    scheduledDate: '2024-01-15T08:00:00',
    recipientsTotal: 3847,
    recipientsDelivered: 0,
    recipientsFailed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
    author: 'Events Team',
    tags: ['Webinar', 'Marketing', 'Enterprise']
  },
  {
    id: 'BRD-2843',
    title: 'Payment Receipt Confirmation',
    subject: 'Payment Received - Invoice #INV-2024-847',
    message: 'Thank you for your payment. This email confirms receipt of $25,000...',
    type: 'transactional',
    status: 'sending',
    channels: ['email', 'in-app'],
    targetSegment: 'Paid Customers',
    sentDate: '2024-01-12T15:30:00',
    recipientsTotal: 847,
    recipientsDelivered: 692,
    recipientsFailed: 12,
    openRate: 95.2,
    clickRate: 12.8,
    bounceRate: 1.4,
    unsubscribeRate: 0,
    author: 'Billing System',
    tags: ['Transactional', 'Payment', 'Receipt']
  },
  {
    id: 'BRD-2842',
    title: 'System Maintenance Notification',
    subject: 'Scheduled Maintenance - January 15th',
    message: 'Our platform will undergo scheduled maintenance on January 15th...',
    type: 'announcement',
    status: 'sent',
    channels: ['email', 'push', 'slack'],
    targetSegment: 'All Active Users',
    sentDate: '2024-01-10T16:00:00',
    recipientsTotal: 32456,
    recipientsDelivered: 32147,
    recipientsFailed: 309,
    openRate: 68.4,
    clickRate: 15.7,
    bounceRate: 0.9,
    unsubscribeRate: 0.2,
    author: 'IT Operations',
    tags: ['Maintenance', 'System', 'Notification']
  },
  {
    id: 'BRD-2841',
    title: 'Customer Satisfaction Survey',
    subject: 'Help Us Improve: Share Your Feedback',
    message: 'Your opinion matters! Take 2 minutes to complete our customer satisfaction survey...',
    type: 'marketing',
    status: 'sent',
    channels: ['email', 'in-app'],
    targetSegment: 'Recent Customers',
    sentDate: '2024-01-07T11:00:00',
    recipientsTotal: 12847,
    recipientsDelivered: 12634,
    recipientsFailed: 213,
    openRate: 34.6,
    clickRate: 18.3,
    bounceRate: 1.7,
    unsubscribeRate: 0.5,
    author: 'Customer Success',
    tags: ['Survey', 'Feedback', 'Customer']
  },
  {
    id: 'BRD-2840',
    title: 'Feature Release: Team Collaboration',
    subject: 'New Feature Alert: Enhanced Team Collaboration',
    message: 'Introducing powerful new team collaboration features to boost your productivity...',
    type: 'announcement',
    status: 'draft',
    channels: ['email', 'push', 'in-app'],
    targetSegment: 'Premium Users',
    recipientsTotal: 5678,
    recipientsDelivered: 0,
    recipientsFailed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
    author: 'Product Team',
    tags: ['Feature', 'Release', 'Collaboration']
  }
]

const stats = [
  {
    label: 'Total Broadcasts',
    value: '1,247',
    change: 18.5,
    trend: 'up' as const,
    icon: Radio
  },
  {
    label: 'Total Delivered',
    value: '2.4M',
    change: 24.3,
    trend: 'up' as const,
    icon: Send
  },
  {
    label: 'Avg Open Rate',
    value: '58.7%',
    change: 6.8,
    trend: 'up' as const,
    icon: Eye
  },
  {
    label: 'Avg Click Rate',
    value: '19.3%',
    change: 4.2,
    trend: 'up' as const,
    icon: TrendingUp
  }
]

const quickActions = [
  { label: 'Create Broadcast', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Send Now', icon: Send, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Schedule Broadcast', icon: Clock, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'View Analytics', icon: TrendingUp, gradient: 'from-orange-500 to-red-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Import Recipients', icon: Upload, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Manage Segments', icon: Users, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Broadcast sent', details: 'Product launch campaign delivered to 24K recipients', time: '2 hours ago' },
  { action: 'High engagement', details: 'Security alert achieved 87% open rate', time: '1 day ago' },
  { action: 'Broadcast scheduled', details: 'Webinar invitation scheduled for Jan 15', time: '1 day ago' },
  { action: 'Campaign completed', details: 'Newsletter delivered successfully', time: '2 days ago' },
  { action: 'Draft created', details: 'Feature release announcement drafted', time: '3 days ago' }
]

const topBroadcasts = [
  { name: 'Critical Security Alert', metric: '87.3% open' },
  { name: 'Payment Receipt Confirmation', metric: '95.2% open' },
  { name: 'System Maintenance Notification', metric: '68.4% open' },
  { name: 'Q1 Product Launch Campaign', metric: '42.5% open' },
  { name: 'Monthly Newsletter - January', metric: '38.9% open' }
]

export default function BroadcastsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'sent' | 'scheduled' | 'sending'>('all')

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    if (viewMode === 'all') return true
    if (viewMode === 'sent') return broadcast.status === 'sent'
    if (viewMode === 'scheduled') return broadcast.status === 'scheduled'
    if (viewMode === 'sending') return broadcast.status === 'sending'
    return true
  })

  const getStatusColor = (status: BroadcastStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'sending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'sent': return 'bg-green-100 text-green-700 border-green-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: BroadcastStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'sending': return <Send className="w-3 h-3" />
      case 'sent': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      default: return <Radio className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: BroadcastType) => {
    switch (type) {
      case 'marketing': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'transactional': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'announcement': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'alert': return 'bg-red-50 text-red-600 border-red-100'
      case 'newsletter': return 'bg-green-50 text-green-600 border-green-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: BroadcastType) => {
    switch (type) {
      case 'marketing': return 'from-purple-500 to-pink-600'
      case 'transactional': return 'from-blue-500 to-cyan-600'
      case 'announcement': return 'from-indigo-500 to-purple-600'
      case 'alert': return 'from-red-500 to-orange-600'
      case 'newsletter': return 'from-green-500 to-emerald-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getChannelIcon = (channel: BroadcastChannel) => {
    switch (channel) {
      case 'email': return <Mail className="w-3 h-3" />
      case 'sms': return <MessageSquare className="w-3 h-3" />
      case 'push': return <Radio className="w-3 h-3" />
      case 'in-app': return <Eye className="w-3 h-3" />
      default: return <Send className="w-3 h-3" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const calculateDeliveryRate = (delivered: number, total: number) => {
    if (total === 0) return 0
    return Math.round((delivered / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Broadcasts
            </h1>
            <p className="text-gray-600 mt-2">Send mass communications across multiple channels</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Broadcast
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
            label="All Broadcasts"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Sent"
            isActive={viewMode === 'sent'}
            onClick={() => setViewMode('sent')}
          />
          <PillButton
            label="Scheduled"
            isActive={viewMode === 'scheduled'}
            onClick={() => setViewMode('scheduled')}
          />
          <PillButton
            label="Sending"
            isActive={viewMode === 'sending'}
            onClick={() => setViewMode('sending')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Broadcasts List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Broadcasts'}
              {viewMode === 'sent' && 'Sent Broadcasts'}
              {viewMode === 'scheduled' && 'Scheduled Broadcasts'}
              {viewMode === 'sending' && 'Broadcasts in Progress'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredBroadcasts.length} total)
              </span>
            </h2>

            {filteredBroadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(broadcast.status)} flex items-center gap-1`}>
                        {getStatusIcon(broadcast.status)}
                        {broadcast.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(broadcast.type)}`}>
                        {broadcast.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {broadcast.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Subject: {broadcast.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      {broadcast.id} • By {broadcast.author} • To: {broadcast.targetSegment}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(broadcast.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {broadcast.status === 'sent' ? 'Sent' : broadcast.status === 'scheduled' ? 'Scheduled' : 'Status'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {broadcast.sentDate ? formatDate(broadcast.sentDate) :
                       broadcast.scheduledDate ? formatDate(broadcast.scheduledDate) : 'Draft'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Recipients</p>
                    <p className="text-sm font-semibold text-gray-900">{broadcast.recipientsTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivered</p>
                    <p className="text-sm font-semibold text-gray-900">{broadcast.recipientsDelivered.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Failed</p>
                    <p className="text-sm font-semibold text-red-600">{broadcast.recipientsFailed.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                {broadcast.status !== 'draft' && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Delivery Rate</span>
                        <span>{calculateDeliveryRate(broadcast.recipientsDelivered, broadcast.recipientsTotal)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeGradient(broadcast.type)} rounded-full transition-all`}
                          style={{ width: `${calculateDeliveryRate(broadcast.recipientsDelivered, broadcast.recipientsTotal)}%` }}
                        />
                      </div>
                    </div>

                    {broadcast.status === 'sent' && (
                      <>
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Open Rate</span>
                            <span>{broadcast.openRate}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                              style={{ width: `${broadcast.openRate}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Click Rate</span>
                            <span>{broadcast.clickRate}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all"
                              style={{ width: `${broadcast.clickRate}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Channels */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {broadcast.channels.map((channel, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100 flex items-center gap-1"
                      >
                        {getChannelIcon(channel)}
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                {broadcast.status === 'sent' && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span>{broadcast.openRate}% opens</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>{broadcast.clickRate}% clicks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>{broadcast.bounceRate}% bounce</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {broadcast.tags.map((tag, index) => (
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

            {/* Broadcast Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Broadcast Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'marketing', count: 427, percentage: 34 },
                  { type: 'transactional', count: 356, percentage: 29 },
                  { type: 'announcement', count: 247, percentage: 20 },
                  { type: 'newsletter', count: 156, percentage: 13 },
                  { type: 'alert', count: 61, percentage: 4 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as BroadcastType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Broadcasts */}
            <RankingList
              title="Best Performers"
              items={topBroadcasts}
              gradient="from-purple-500 to-pink-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Delivery Success"
              value="98.2%"
              change={2.4}
              trend="up"
            />

            <ProgressCard
              title="Monthly Target"
              current={84}
              target={100}
              label="broadcasts sent"
              gradient="from-purple-500 to-pink-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
